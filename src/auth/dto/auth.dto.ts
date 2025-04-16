import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsJWT, IsMobilePhone, IsString, IsUUID, Length } from "class-validator";
import { IsEmailOrMobile } from "src/common/decorators/email-or-mobile.decorator";
import { ConfirmedPassword } from "src/common/decorators/password.decorator";
import { role } from "src/common/enums/role.enum";

export class CreateOtpDto {
  @ApiProperty({ example: "Name" })
  @IsString()
  first_name: string;
  @ApiProperty({ example: "Last-Name" })
  @IsString()
  last_name: string;
  @ApiProperty({ example: "Email" })
  @IsString()
  @IsEmail({},{message : "ایمیل نادرست میباشد."})
  email : string
  @ApiProperty({ example: "password" })
  @Length(6,25,{message : "پسورد باید بین ۶ الی ۲۵ کاراکتر  باشد."})
  @IsString()
  password: string;
  @ApiProperty({ example: "confirm_password" })
  @ConfirmedPassword("password")
  @IsString()
  confirm_password: string;
  @ApiProperty({ example: "00000" })
  @IsString()
  @Length(5, 5, { message: "کد تایید باید 5 رقم باشد" })
  otp: string;

}
export class SendOtpDto {
  @ApiProperty({ example: "09100000000" })
  @IsMobilePhone("fa-IR", {}, { message: "شماره تلفن نادرست میباشد." })
  mobile: string;
}
export class CheckOtpDto {
  @ApiProperty({ example: "09100000000" })
  @IsMobilePhone("fa-IR", {}, { message: "شماره تلفن نادرست میباشد." })
  mobile: string;
  @ApiProperty({ example: "00000" })
  @IsString()
  @Length(5, 5, { message: "کد تایید باید 5 رقم باشد" })
  code: string;
}
export class LoginDto{
  @ApiProperty({ example: "Email or Mobile" })
  @IsString()
  @IsEmailOrMobile()
  Username: string;
  @ApiProperty({ example: "password" })
  @Length(6,15,{message : "پسورد باید بین ۶ الی ۱۵ کاراکتر  باشد."})
  @IsString()
  password: string;
}
export class RoleDto {
  @ApiProperty({ example: "09100000000" })
  @IsMobilePhone("fa-IR", {}, { message: "شماره تلفن نادرست میباشد." })
  mobile: string;
  @ApiProperty({ enum: role })
  @IsString()
  role: string;
}
export class RefreshTokenDto {
  @ApiProperty()
  @IsJWT({ message: "token incorrect" })
  RefreshToken: string;
}
export class ResetPasswordDto {
  @ApiProperty({ example: "Token" })
  @IsUUID()
  @IsString()
  token : string
  @ApiProperty({ example: "password" })
  @Length(6,25,{message : "پسورد باید بین ۶ الی ۲۵ کاراکتر  باشد."})
  @IsString()
  new_password: string;
  @ApiProperty({ example: "confirm_new_password" })
  @ConfirmedPassword("new_password")
  @IsString()
  confirm_new_password: string;
}