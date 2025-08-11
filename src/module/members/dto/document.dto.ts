import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from "class-validator";
import { skillEnum } from "src/common/enums/skill.enum";
import { Type } from "class-transformer";

export class DocumentDto {
    @ApiProperty()
    @Length(10,10,{message : "کد ملی باید 10 رقم باشد"})
    national_code : string
    @ApiProperty()
    @Matches(/^\d{9}$|^\d{14}$/,{ message: "شماره دانشجویی باید 9 یا 14 رقم باشد" })
    student_number : string
    @ApiPropertyOptional({enum : skillEnum, type : "array", items : {type : "string"}})
    @IsOptional()
    @IsArray()
    @IsString({each : true})
    skills : string[]
    @ApiPropertyOptional({format : "binary"})
    @IsOptional()
    @IsString()
    resume : string
    @ApiProperty({format : "binary"})
    @IsString()
    studentCard_image : string
    @ApiProperty({enum : {Male : "male", Female : "female"}})
    gender : string
    @ApiPropertyOptional({ minimum: 1350, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "سال ورود صحیح وارد کنید" })
    @Min(1350, { message: "سال ورود صحیح وارد کنید" })
    entry_year : number
    @ApiProperty({ minimum: 5, maximum: 20, type: Number, format: "float", description: "مقدار معدل صحیح نمیباشد" })
    @Type(() => Number)
    @Min(5, { message: "مقدار معدل صحیح نمیباشد" })
    @Max(20, { message: "مقدار معدل صحیح نمیباشد" })
    GPA: number
}