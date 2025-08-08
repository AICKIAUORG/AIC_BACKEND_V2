import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { Repository, } from "typeorm";
import { UpdateUserDto, UserSearchDto } from "./dto/user.dto";
import { mobileValidation } from "src/common/utility/mobile.utils";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { DateConvertor, PaginationGenerator, paginationSolver, } from "src/common/utility/function.utils";
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}
  
  async findUsers(paginationDto: PaginationDto, searchDto: UserSearchDto) {
    const { search, mobile, from_date, to_date, membership } = searchDto;
    const { page, limit, skip } = paginationSolver(paginationDto);
    const query = this.userRepository.createQueryBuilder("users");
    query.leftJoinAndSelect("users.membership", "membership");

    if (mobile) {
      query.andWhere("users.mobile = :mobile", { mobile });
    }
    if (membership !== undefined) {
      if (membership) {
        console.log(membership);
        query.andWhere("users.membership_id IS NOT NULL");
      } else {
        console.log("object");
        query.andWhere("users.membership_id IS NULL");
      }
    }
    if (
      to_date &&
      from_date
    ) {
      const to = new Date(DateConvertor(to_date))
      const from = new Date(DateConvertor(from_date))
      query.andWhere("users.created_at BETWEEN :from AND :to", { from, to });
    } else if (from_date) {
      const from = new Date(DateConvertor(from_date))
      query.andWhere("users.created_at >= :from", { from });
    } else if (to_date) {
      const to = new Date(DateConvertor(to_date))
      query.andWhere("users.created_at <= :to", { to });
    }
    if (search && search.length >= 3) {
      query.andWhere(
        "users.first_name LIKE :search OR users.last_name LIKE :search",
        { search: `%${search}%` }
      );
    } else if (search && search.length < 3) {
      throw new BadRequestException(
        "تعداد کاراکتر های سرچ نمیتواند کمتر از ۳ کاراکتر باشد."
      );
    }
    query.take(limit);
    query.skip(skip);
    query.orderBy("users.created_at", "DESC");
    const [users, count] = await query.getManyAndCount();

    if (users.length == 0) throw new NotFoundException("نتیحه ای یافت نشد.");
    return {
      pagination: PaginationGenerator(page, limit, count),
      users,
    };
  }

  async update(QueryMobile: string, updateUserDto: UpdateUserDto) {
    const { first_name, last_name, mobile } = updateUserDto;
    const { phoneNumber } = mobileValidation(QueryMobile);
    const user = await this.checkExistUser(phoneNumber);
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.mobile = mobile || user.mobile;
    return await this.userRepository.save(user);
  }

  async remove(mobile: string) {
    await this.checkExistUser(mobile);
    const result = await this.userRepository.delete({ mobile });
    if (result.affected !== 1)
      throw new BadRequestException("مشکلی در هنگام حذف کاربر پیش آمد.");
    return { message: "کاربر با موفقیت حذف شد." };
  }

  async checkExistUser(mobile: string) {
    const user = await this.userRepository.findOne({ where: { mobile } });
    if (!user) {
      throw new NotFoundException("کاربر یافت نشد");
    }
    return user;
  }

  async checkExistUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id }
    });
    if (!user) {
      throw new NotFoundException("کاربر یافت نشد");
    }
    return user;
  }
}
