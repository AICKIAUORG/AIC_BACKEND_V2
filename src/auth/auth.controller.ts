import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateOtpDto, LoginDto, RefreshTokenDto, ResetPasswordDto, SendOtpDto } from "./dto/auth.dto";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SwaggerEnums } from "src/common/enums/swagger.enum";
import { AuthGuard } from "./guard/auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { role } from "src/common/enums/role.enum";

@Controller("auth")
@UseGuards(AuthGuard)
@ApiTags("Auth")
@ApiBearerAuth("Authorization")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiConsumes(SwaggerEnums.UrlEncoded)
  @Post("sendOTP")
  @ApiOperation({ summary: "send otp code for user" })
  @ApiResponse({
    status: 201,
    description: "after sending verification code successfully",
    example: {
      "message": "کد تایید ارسال شد.",
      "statusCode": 201
    }
  })
  @ApiResponse({
    status: 409,
    description: "if the verification code has not expired",
    example: {
      "message": "کد تایید منقضی نشده است.",
      "remain_time": "02:00",
      "statusCode": 409
    },
  })
  @ApiResponse({
    status: 403,
    description: "if the mobile number is already registered ",
    example: {
      "message": "این شماره موبایل قبلا ثبت شده است.",
      "error": "Forbidden",
      "statusCode": 403
    }
  })
  sendOtp(@Body() otpDto: SendOtpDto) {
    return this.authService.sendOtp(otpDto);
  }

  @ApiConsumes(SwaggerEnums.UrlEncoded)
  @Post("signup:mobile")
  @ApiOperation({ summary: "users signup section" })
  @ApiResponse({
    status: 201,
    description: "after successful signup",
    example: {
      "message": "کاربر با موفقیت ثبت نام شد.",
      "accessToken": "eyJhbGciOiJIUzI1NiIsIR5cCI6IkpXVCJ9.eyJpZCI6NCwibW9iaWxlIjoiMDkxMDAwMDAwMDEiLCJpYXQiOjE3NDQ4MTI4OTEsImV4cCI6MTc0NzQwNDg5MX0.zNOS0NuC2Db0nLdlgCJMMpWWU4BJ2JPMBLPS6om8cKQ",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5CI6IkpXVCJ9.eyJpZCI6NCwibW9iaWxlIjoiMDkxMDAwMDAwMDEiLCJpYXQiOjE3NDQ4MTI4OTEsImV4cCI6MTc3NjM3MDQ5MX0.-_jpxNAdq7SEVnMXAlREbZ3iKJDPtqHIXFZkrqDal_A",
      "statusCode": 201
    }
  })
  @ApiResponse({
    status: 409,
    description: "if the user is already registered",
    example: {
      "message": ".با این شماره تلفن قبلا ثبت نام کرده اید",
      "error": "Conflict",
      "statusCode": 409
    }
  })
  signup(
    @Body() otpDto: CreateOtpDto,
    @Param('mobile') mobile : string 
  ) {
    return this.authService.signup(mobile, otpDto);
  }

  @ApiConsumes(SwaggerEnums.UrlEncoded)
  @Post("login")
  @ApiOperation({ summary: "Login section" })
  @ApiResponse({
    status: 201,
    description: "after successful login",
    example: {
      "message": "کاربر با موفقیت لاگین شد.",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC9.eyJpZCI6MywibW9iaWxlIjoiMDkxMDAwMDAwMDAiLCJpYXQiOjE3NDQ4MTE4NzYsImV4cCI6MTc0NzQwMzg3Nn0.oKPFL1uypQbgQHSaJrfyz9HHwP-b2FDy9v8DCzZr-fY",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ.eyJpZCI6MywibW9iaWxlIjoiMDkxMDAwMDAwMDAiLCJpYXQiOjE3NDQ4MTE4NzYsImV4cCI6MTc3NjM2OTQ3Nn0.QNyFPPkfMPE6okp9ZPm9REE0idRkmNMcLyESIqYkoug",
      "statusCode": 201
    }
  })
  @ApiResponse({
    status: 401,
    description: "if the verification code has not expired",
    example: {
      "message": "نام کاربری یا پسورد نادرست میباشد.",
      "error": "Unauthorized",
      "statusCode": 401
    }
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // @Roles([role.ADMIN])
  @Post("refreshToken")
  @ApiOperation({ summary: "generate new refresh token after expiration" })
  @ApiResponse({
    status: 201,
    description: "after the operation was successful",
    example: {
      "accessToken":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidXNlciIsImlkIjo2LCJtb2JpbGUiOiIwOTEwMDAwMDAwMCIsImlhdCI6MTczODI0ODU4NiwiZXhwIjoxNzQwODQwNTg2fQ.Y6xuYZcoV6TjSr4w8at68RoO7RIkt__iEC792YU5T_s",
      "refreshToken":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidXNlciIsImlkIjo2LCJtb2JpbGUiOiIwOTEwMDAwMDAwMCIsImlhdCI6MTczODI0ODU4NiwiZXhwIjoxNzY5ODA2MTg2fQ.3ale6H6SsFJwotA7lgX0RI49f7YFv95dzotcvUsxQi4",
      "statusCode": 201
    },
  })
  @ApiResponse({
    status: 401,
    description: "if token was not correct",
    example: {
      "message": "رفرش توکن معبر وارد کنید",
      "error": "Unauthorized",
      "statusCode": 401
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.verifyRefreshToken(refreshTokenDto);
  }

  @Post("resetLink")
  @ApiOperation({ summary: "generate a reset password link" })
  @ApiResponse({
    status: 201,
    description: "after the operation was successful",
    example: {
      "message": "لینک ریست پسورد ارسال شد.",
      "link": "https://aic.ir/user/reset-password?token=db6e2d8c-2a4d-464a-bc6c-ad3ceb5a7482"
    }
  })
  @ApiResponse({
    status: 401,
    description: "Error",
    example: {
      "message": "شما می‌توانید فقط هر ۲۴ ساعت یکبار لینک دریافت کنید.",
      "error": "Unauthorized",
      "statusCode": 401
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  resetLink(@Body() mobileDto: SendOtpDto) {
    return this.authService.resetPasswordLink(mobileDto);
  }

  @Post("resetPassword")
  @ApiOperation({ summary: "reset password" })
  @ApiResponse({
    status: 201,
    description: "after the operation was successful",
    example: {
      "message": "پسورد شما با موفقیت تغییر کرد.",
      "statusCode": 201
    }
  })
  @ApiResponse({
    status: 401,
    description: "Error",
    example: {
      "message": "شما می‌توانید فقط هر ۲۴ ساعت یکبار لینک دریافت کنید.",
      "error": "Unauthorized",
      "statusCode": 401
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  resetPassword(@Body() resetDto: ResetPasswordDto) {

    return this.authService.resetPassword(resetDto.token, resetDto.new_password);
  }

} 