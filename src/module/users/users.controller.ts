import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Query, Put, } from "@nestjs/common";
import { UsersService } from "./users.service";
import { FindUserDto, UpdateUserDto, UserSearchDto, } from "./dto/user.dto";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags, } from "@nestjs/swagger";
import { SwaggerEnums } from "src/common/enums/swagger.enum";
import { Access } from "src/common/decorators/roles.decorator";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { role } from "src/common/enums/role.enum";
import { AuthGuard } from "src/auth/guard/auth.guard";

@Controller("users")
@ApiTags("Users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: "Search users",
    description: "Search and filter users with various options",
  })
  @ApiResponse({
    status: 200,
    description: "When users are found",
    schema: {
      example: {
        pagination: {
          total_count: 25,
          page: 0,
          limit: 10,
          skip: 0,
        },
        users: [
          {
            id: 1,
            first_name: "پویا",
            last_name: "عباداللهی",
            mobile: "09196715197",
            email: "pooya@example.com",
            submitted_at: "1404/03/26 14:30",
            membership: true
          },
          {
            id: 2,
            first_name: "علی",
            last_name: "احمدی",
            mobile: "09123456789",
            email: "ali@example.com",
            submitted_at: "1404/03/25 10:15",
            membership: false
          }
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "When input parameters are invalid",
    schema: {
      example: {
        message: "تعداد کاراکتر های سرچ نمیتواند کمتر از ۳ کاراکتر باشد.",
        error: "Bad Request",
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "When no results are found",
    schema: {
      example: {
        message: "نتیحه ای یافت نشد.",
        error: "Not Found",
        statusCode: 404,
      },
    },
  })
  find(
    @Query() searchDto: UserSearchDto
  ) {
    const paginationDto = {limit : searchDto.limit, page : searchDto.page}
    return this.usersService.findUsers(paginationDto, searchDto);
  }

  @Patch("update-user:mobile")
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({
    status: 200,
    description: "After updating user information",
    schema: {
      example: {
        id: 2,
        first_name: "پویا",
        last_name: "عباداللهی",
        mobile: "09196715197",
        mobile_verify: false,
        role: "user",
        created_at: "2025-06-24T13:21:29.000Z",
        updated_at: "2025-01-28T17:44:57.000Z",
        otp: null,
        expires_in: null,
      },
    },
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  update(@Param() userDto: FindUserDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userDto.mobile, updateUserDto);
  }

  @Delete(":mobile")
  @ApiOperation({ summary: "Delete user information" })
  @ApiResponse({
    status: 200,
    description: "If deletion was successful",
    schema: {
      example: {
        message: "کاربر با موفقیت حذف شد.",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "If deletion was not successful",
    schema: {
      example: {
        message: "کاربر یافت نشد",
        error: "Not Found",
        statusCode: 404,
      },
    },
  })
  remove(@Param() userDto: FindUserDto) {
    return this.usersService.remove(userDto.mobile);
  }
}
