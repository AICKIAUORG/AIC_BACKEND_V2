import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Query, Put, } from "@nestjs/common";
import { UsersService } from "./users.service";
import { FindUserDto, UpdateUserDto, UserSearchDto, } from "./dto/user.dto";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags, } from "@nestjs/swagger";
import { SwaggerEnums } from "src/common/enums/swagger.enum";
import { Roles } from "src/common/decorators/roles.decorator";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { role } from "src/common/enums/role.enum";
import { AuthGuard } from "src/auth/guard/auth.guard";

@Controller("users")
@ApiBearerAuth("Authorization")
@UseGuards(AuthGuard)
@ApiTags("Users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles([role.ADMIN]) 
  @Get()
  @ApiOperation({
    summary: "search users",
    description: "you can find users with following options",
  })
  @ApiResponse({
    status: 200,
    description: "when users found",
    schema: {
      example: {
        pagination: {
          total_count: 1,
          page: 0,
          limit: "10",
          skip: 0,
        },
        user: [
          {
            id: 1,
            first_name: "پویا",
            last_name: "عباداللهی",
            mobile: "09196715197",
            wallet: 99999,
            mobile_verify: true,
            role: "admin",
            created_at: "2025-03-25T18:01:20.338Z",
            updated_at: "2025-01-28T15:10:05.214Z",
            otp: "90483",
            expires_in: "2025-01-28T14:46:09.000Z",
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "when no result found",
    schema: {
      example: {
        message: "نتیحه ای یافت نشد.",
        error: "Not Found",
        statusCode: 404,
      },
    },
  })
  @Pagination()
  find(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: UserSearchDto
  ) {
    return this.usersService.findUsers(paginationDto, searchDto);
  }

  @Roles([role.ADMIN])
  @Patch("update-user:mobile")
  @ApiOperation({ summary: "update user profile" })
  @ApiResponse({
    status: 200,
    description: "after updating user information",
    schema: {
      example: {
        id: 2,
        first_name: "پویا",
        last_name: "عباداللهی",
        mobile: "09196715197",
        wallet: 99999,
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

  @Roles([role.ADMIN])
  @Delete(":mobile")
  @ApiOperation({ summary: "delete user information" })
  @ApiResponse({
    status: 200,
    description: "if deletion was successful",
    schema: {
      example: {
        message: "کاربر با موفقیت حذف شد.",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "if deletion was not successful",
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
