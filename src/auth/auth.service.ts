import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomInt} from "crypto";
import { CheckOtpDto, CreateOtpDto, LoginDto, RefreshTokenDto, SendOtpDto } from "./dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { TokenPayload } from "src/common/types/payload";
import { mobileValidation } from "src/common/utility/mobile.utils";
import { role } from "src/common/enums/role.enum";
import { Request } from "express";
import { UserEntity } from "src/module/users/entities/user.entity";
import { compareSync, genSaltSync, hashSync,  } from "bcrypt"
import * as moment from "moment-jalaali";
import { OneTimeToken } from "./entities/one-time-token.entity";
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OneTimeToken)
    private tokenRepository: Repository<OneTimeToken>,
    private jwtService: JwtService
  ) {}
  async signup(mobile : string, OtpDto: CreateOtpDto) {
    const { first_name, last_name, password, email, otp } = OtpDto;
    const { phoneNumber } = mobileValidation(mobile);
    await this.checkExist(email, phoneNumber)
    const { accessToken, refreshToken } = await this.checkOtp(phoneNumber, otp)
    const hashedPassword = this.hashPassword(password)
    await this.userRepository.update({ mobile : phoneNumber } ,{
      first_name,
      last_name,
      email,
      mobile: phoneNumber,
      password : hashedPassword
    });
    return {
      message: "کاربر با موفقیت ثبت نام شد.",
      accessToken,
      refreshToken,
      statusCode: 201
    };
  }
  private createOtp() {
    let code = randomInt(10000, 99999).toString();
    let expiration = new Date(new Date().getTime() + 1000 * 60 * 2);
    return { code, expiration };
  }

  async sendOtp(OtpDto: SendOtpDto) {
    const { mobile } = OtpDto;
    const { phoneNumber } = mobileValidation(mobile);
    const { code, expiration } = this.createOtp();
    const date = new Date().getTime();

    let user = await this.userRepository.findOneBy({ mobile: phoneNumber });
    if(user?.mobile_verify){
      throw new ForbiddenException("این شماره موبایل قبلا ثبت شده است.")
    }
    if(user){
      if (user?.expires_in > new Date(date)) {
        const remain = new Date(user.expires_in.getTime() - date);
        let [remainMin, remainSec] = [
          remain.getUTCMinutes(),
          remain.getUTCSeconds(),
        ];
        const remainTime = `0${remainMin}:${remainSec < 10 ? `0${remainSec}` : remainSec}`;
        throw new ConflictException({
          message: "کد تایید منقضی نشده است.",
          remain_time: remainTime,
          statusCode: 409
        });
      }
      user.otp = code;
      user.expires_in = expiration;
      await this.userRepository.save(user);
    } else {
      const user = this.userRepository.create({
        first_name : "Not Verified",
        last_name : "Not Verified",
        email : "Not Verified",
        mobile: phoneNumber,
        password : "Not Verified",
        otp: code,
        expires_in: expiration,
      });
      await this.userRepository.save(user);
    }
    return {
      message: "کد تایید ارسال شد.",
      statusCode : 201,
      code
    };
  }

  private async checkExist(email : string, mobile : string){
    const emailSearch = await this.userRepository.findOneBy({email})
    const mobileSearch = await this.userRepository.findOneBy({mobile})
    if(mobileSearch?.mobile_verify && emailSearch?.mobile_verify){
      throw new ConflictException("این شماره تلفن و ایمیل قبلا ثبت شده است") 
    }
    if(mobileSearch?.mobile_verify){
      throw new ConflictException("این شماره تلفن قبلا ثبت شده است") 
    }
    if(emailSearch?.mobile_verify){
        throw new ConflictException("این ایمیل قبلا ثبت شده است")
    }
  }

  async checkOtp(mobile : string, code : string) {

    let profile = await this.userRepository.findOneBy({ mobile });
    const now = new Date();

    if (profile?.expires_in < now) {
      throw new UnauthorizedException("کد تایید نامعتبر میباشد.");
    }

    if (!profile || !profile?.otp) {
      throw new NotFoundException("کاربر یافت نشد.");
    }

    if (profile?.otp !== code) {
      throw new UnauthorizedException("کد تایید اشتباه میباشد.");
    }

    if (!profile?.mobile_verify) {
      
        await this.userRepository.update(
            { id: profile.id },
            {
                mobile_verify : true
            }
        )
    }
    const { accessToken, refreshToken } = this.TokenGenerator({
      id: profile?.id,
      mobile: profile?.mobile,
      membership : profile?.membership ? true : false,
      token_version : profile?.token_version + 1
    });
    profile.token_version += 1
    await this.userRepository.save(profile)
    return {
      accessToken,
      refreshToken
    };
  }

  async login(loginDto : LoginDto){
    const { Username, password } = loginDto
    const user = await this.userRepository.findOne({
      relations : {membership : true},
      where: [
        {
          email : Username
        },
        {mobile : Username}
      ]
    })
    if(user){
      if(compareSync(password, user.password)){
        const { accessToken, refreshToken } = this.TokenGenerator({
          id: user?.id,
          mobile: user?.mobile,
          membership : user?.membership ? true : false,
          token_version : user?.token_version + 1
        });
        user.token_version += 1
        await this.userRepository.save(user)
        return {
          message : "کاربر با موفقیت لاگین شد.",
          accessToken,
          refreshToken,
          statusCode : 201
        };
      }
    }
    throw new UnauthorizedException("نام کاربری یا پسورد نادرست میباشد.")
  }

  TokenGenerator(payload: TokenPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: "30d",
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: "1y",
    });
    return {
      accessToken,
      refreshToken,
      statusCode: 201
    };
  }

  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      let user: UserEntity;
      if (typeof payload == "object" && payload?.id) {
        
        user = await this.userRepository.findOneBy({ id: payload.id });
        if (!user) {
          throw new UnauthorizedException("لطفا وارد اکانت خود شوید.");
        }
        if(user.token_version !== payload.token_version){
          throw new UnauthorizedException("token is not valid");
        }
        return payload;
      }
      throw new UnauthorizedException("لطفا وارد اکانت خود شوید.");
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  hashPassword(password : string){
    const salt = genSaltSync(10)
    return hashSync(password , salt)
  }
  
  async verifyRefreshToken(refreshToken: RefreshTokenDto) {
    const { RefreshToken } = refreshToken;
    try {
      const verify = this.jwtService.verify<TokenPayload>(RefreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      if (verify.mobile) {
        const { id, mobile, membership, token_version } = verify;
        await this.userRepository.update({id : verify.id}, {token_version : token_version + 1})
        return this.TokenGenerator({ id, mobile , membership, token_version : token_version + 1});
      }
      throw new UnauthorizedException("رفرش توکن معبر وارد کنید");
    } catch (error) {
      throw new UnauthorizedException("رفرش توکن معبر وارد کنید");
    }
  }

  async resetPasswordLink(mobileDto : SendOtpDto){
    const { mobile } = mobileDto
    const { phoneNumber } = mobileValidation(mobile)
    const user = await this.userRepository.findOneBy({mobile : phoneNumber})
    if(user && user?.mobile_verify){
      const guard = await this.tokenRepository.findOne({
        where: {
          userId: user.id
        },
        order: { createdAt: "DESC" }
      });
      const currentTime = new Date();
      if (guard && guard?.used === true) {
          const createdAt = new Date(guard.createdAt);
          if (currentTime.getTime() - createdAt.getTime() < 24 * 60 * 60 * 1000) {
              throw new UnauthorizedException("شما می‌توانید فقط هر ۲۴ ساعت یکبار لینک دریافت کنید.");
          }
      }
      if (guard && guard?.used === false) {
          const createdAt = new Date(guard.createdAt);
          if (currentTime.getTime() - createdAt.getTime() < 10 * 60 * 1000) {
              throw new UnauthorizedException("لطفا دقایقی دیگر مجدد تلاش کنید.");
          }
      }
      const new_token = this.tokenRepository.create({
        userId : user.id,
        expiresAt : new Date(Date.now() + 10 * 60 * 1000),
      })
      const savedToken = await this.tokenRepository.save(new_token)
      return {
        message : "لینک ریست پسورد ارسال شد.",
        link : `https://aic.ir/user/reset-password?token=${savedToken.token}`
      }
    }
    throw new NotFoundException("کاربر یافت نشد.")

  }

  async resetPassword(token : string, newPassword : string){
    const currentTime = new Date();
    const data = await this.tokenRepository.findOneBy({token})
    if(!data || data?.used || new Date(data.expiresAt).getTime() < currentTime.getTime()){
      throw new UnauthorizedException("توکن نا معتبر میباشد.")
    }
    await this.tokenRepository.update({token}, {
      used : true
    })
    await this.userRepository.update({id : data.userId},{
      password : this.hashPassword(newPassword)
    })
    return {
      message : "پسورد شما با موفقیت تغییر کرد.",
      statusCode: 201
    }

  }
}