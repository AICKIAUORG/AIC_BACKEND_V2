import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsMobilePhone, IsOptional, IsString, Matches, IsBoolean } from "class-validator";

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
  @ApiPropertyOptional({ description: "in 2025-01-28 18:11:42.000000 format" })
  to_date: string;
  @ApiPropertyOptional({ description: "in 2025-01-28 18:11:42.000000 format" })
  from_date: string;
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
