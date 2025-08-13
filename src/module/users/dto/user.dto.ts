import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsMobilePhone, IsOptional, IsString, Matches, IsBoolean, IsInt, Min, Max } from "class-validator";
import { IsJalaliDateTime } from "src/common/decorators/date.decorator";

export class UserSearchDto {
  @ApiPropertyOptional({ description: "At least 3 characters are required" })
  search: string;
  @ApiPropertyOptional({ type : "boolean" })
  @IsOptional()
  @IsBoolean({ message: "membership باید boolean باشد" })
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1) return true;
    if (value === 'false' || value === false || value === 0) return false;
    if (value === '' || value === null || value === undefined) return undefined;
    return undefined;
  })
  membership: boolean;
  @ApiPropertyOptional({ example: "09100000000" })
  @IsOptional()
  @IsMobilePhone("fa-IR", {}, { message: "شماره تلفن نادرست میباشد." })
  mobile: string;
  @ApiPropertyOptional({ description: "in 1404/03/26 HH:MM format" })
  @IsOptional()
  @IsJalaliDateTime({ message : "تاریخ وارد شده معتبر نیست" })
  from_date: string;
  @ApiPropertyOptional({ description:"in 1404/03/26 HH:MM format" })
  @IsOptional()
  @IsJalaliDateTime({ message : "تاریخ وارد شده معتبر نیست" })
  to_date: string;
  @ApiPropertyOptional({ 
    description: 'Page number (0-based)', 
    example: 0, 
    minimum: 0,
    default: 0 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(0, { message: 'Page must be 0 or greater' })
  page?: number;

  @ApiPropertyOptional({ 
      description: 'Number of items per page', 
      example: 10, 
      minimum: 1,
      maximum: 100,
      default: 10 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be 1 or greater' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;
}

export class FindUserDto {
  @ApiProperty({ example: "09100000000" })
  @IsMobilePhone("fa-IR", {}, { message: "شماره تلفن نادرست میباشد." })
  mobile: string;
}
export class CreateUserDto {
  @ApiProperty({example : "Name"})
  @IsString()
  first_name: string;
  @ApiProperty({example : "Last-Name"})
  @IsString()
  last_name: string;
  @ApiProperty({ example: "09100000000" })
  @IsMobilePhone("fa-IR", {}, { message: "شماره تلفن نادرست میباشد." })
  mobile: string;
}
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: "09100000000" })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? null : value))
  @IsMobilePhone("fa-IR", {}, { message: "شماره تلفن نادرست میباشد." })
  mobile: string;
}
