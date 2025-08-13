import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsInt, IsMobilePhone, IsNotEmpty, IsOptional, IsString, Length, Matches, Max, Min } from "class-validator";
import { skillEnum } from "src/common/enums/skill.enum";
import { Type, Transform } from "class-transformer";
import { IsJalaliDateTime } from "src/common/decorators/date.decorator";

export class DocumentDto {
    @ApiProperty()
    @Length(10,10,{message : "کد ملی باید 10 رقم باشد"})
    national_code : string
    
    @ApiProperty()
    @Matches(/^\d{9}$|^\d{14}$/,{ message: "شماره دانشجویی باید 9 یا 14 رقم باشد" })
    student_number : string
    
    @ApiPropertyOptional({enum : skillEnum, type : "array",items : {type : "string"}})
    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return [];
        if (typeof value === 'string') {
            if (value.includes(',')) {
                return value.split(',').map(skill => skill.trim()).filter(skill => skill);
            }
            return [value.trim()];
        }
        if (Array.isArray(value)) {
            return value.map(skill => typeof skill === 'string' ? skill.trim() : skill);
        }
        return [];
    })
    @IsArray({ message: "skills must be an array" })
    @IsEnum(skillEnum, { each: true, message: "Invalid skill value" })
    skills : string[]
    @ApiPropertyOptional({format : "binary"})
    @IsOptional()
    @IsString()
    resume : string
    @ApiProperty({format : "binary"})
    studentCard_image : string
    @ApiProperty({enum : {Male : "male", Female : "female"}})
    @IsString()
    @IsEnum({ Male: "male", Female: "female" }, { message: "مقدار جنسیت صحیح نمیباشد." })
    gender : string
    @ApiPropertyOptional({ minimum: 1350, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "سال ورود صحیح وارد کنید" })
    @Min(1350, { message: "سال ورود صحیح وارد کنید" })
    entry_year : number
    @ApiProperty({ minimum: 5, maximum: 20, type: Number, format: "float" })
    @Type(() => Number)
    @Min(5, { message: "مقدار معدل صحیح نمیباشد" })
    @Max(20, { message: "مقدار معدل صحیح نمیباشد" })
    GPA: number
}

export class MemberSearchDto {
    @ApiPropertyOptional({ description: "At least 3 characters are required" })
    search: string;
    @ApiPropertyOptional()
    @IsOptional()
    @Length(10,10,{message : "کد ملی باید 10 رقم باشد"})
    national_code : string
    @ApiPropertyOptional()
    @Matches(/^\d{9}$|^\d{14}$/,{ message: "شماره دانشجویی باید 9 یا 14 رقم باشد" })
    @IsOptional()
    student_number : string
    @ApiPropertyOptional({enum : skillEnum, type : "array",items : {type : "string"}})
    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return [];
        if (typeof value === 'string') {
            if (value.includes(',')) {
                return value.split(',').map(skill => skill.trim()).filter(skill => skill);
            }
            return [value.trim()];
        }
        if (Array.isArray(value)) {
            return value.map(skill => typeof skill === 'string' ? skill.trim() : skill);
        }
        return [];
    })
    @IsArray({ message: "skills must be an array" })
    @IsEnum(skillEnum, { each: true, message: "Invalid skill value" })
    skills : string[]
    @ApiPropertyOptional({enum : {Male : "male", Female : "female"}})
    @IsOptional()
    @IsString()
    @IsEnum({ Male: "male", Female: "female" }, { message: "مقدار جنسیت صحیح نمیباشد." })
    gender : string
    @ApiPropertyOptional()
    @IsOptional()
    @IsMobilePhone("fa-IR", {}, { message: "شماره تلفن نادرست میباشد." })
    mobile: string;
    @ApiPropertyOptional({ minimum: 1350, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "سال ورود صحیح وارد کنید" })
    @Min(1350, { message: "سال ورود صحیح وارد کنید" })
    start_entry : number
    @ApiPropertyOptional({ minimum: 1350, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "سال ورود صحیح وارد کنید" })
    @Min(1350, { message: "سال ورود صحیح وارد کنید" })
    end_entry : number
    @ApiPropertyOptional({ minimum: 1350, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "سال ورود صحیح وارد کنید" })
    @Min(1350, { message: "سال ورود صحیح وارد کنید" })
    entry : number
    @ApiPropertyOptional({ minimum: 5, maximum: 20, type: Number, format: "float" })
    @IsOptional()
    @Type(() => Number)
    @Min(5, { message: "مقدار معدل صحیح نمیباشد" })
    @Max(20, { message: "مقدار معدل صحیح نمیباشد" })
    start_GPA: number
    @ApiPropertyOptional({ minimum: 5, maximum: 20, type: Number, format: "float" })
    @IsOptional()
    @Type(() => Number)
    @Min(5, { message: "مقدار معدل صحیح نمیباشد" })
    @Max(20, { message: "مقدار معدل صحیح نمیباشد" })
    end_GPA: number
    @ApiPropertyOptional({ minimum: 5, maximum: 20, type: Number, format: "float" })
    @IsOptional()
    @Type(() => Number)
    @Min(5, { message: "مقدار معدل صحیح نمیباشد" })
    @Max(20, { message: "مقدار معدل صحیح نمیباشد" })
    GPA: number
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