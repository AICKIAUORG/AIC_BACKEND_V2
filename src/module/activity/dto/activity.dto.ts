import { ActivityStatusEnum, ActivityType, WarningTypeEnum } from "src/common/enums/activity.enum";
import { IsEnum, IsString, IsNumber, IsOptional, IsDate, IsBoolean, IsObject, Min, Max, IsInt, isNumber } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StatusEnum } from "src/common/enums/status.enum";
import { IsJalaliDateTime } from "src/common/decorators/date.decorator";
import { Type } from "class-transformer";

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, description: "نوع فعالیت" })
  @IsEnum(ActivityType)
  activity_type: ActivityType;

  @ApiProperty({ description: "توضیحات فعالیت" })
  @IsString()
  description: string;

  @ApiProperty({ description: "امتیاز تعلق گرفته" })
  @IsNumber()
  @Min(5,{message : "حداقل مقدار امتیاز 5 میباشد."})
  points?: number;

  @ApiProperty({ description: "شناسه کاربر دریافت‌کننده امتیاز" })
  @IsNumber()
  member_id: number;
}

export class UpdateActivityDto {
  @ApiProperty({ enum: ActivityStatusEnum, description: "وضعیت فعالیت" })
  @IsEnum(ActivityStatusEnum)
  status: ActivityStatusEnum;

  @ApiProperty({ description: "نظرات تاییدکننده", required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
export class WarningDto {
  @ApiProperty({ description: "شناسه کاربر" })
  @IsNumber()
  member_id: number;

  @ApiProperty({ enum: WarningTypeEnum, description: "نوع اخطار" })
  @IsEnum(WarningTypeEnum)
  warning_type: WarningTypeEnum;

  @ApiProperty({ description: "توضیحات اخطار" })
  @IsString()
  notes: string;
}

export class ApproveActivityDto {
  @ApiProperty({ description: "شناسه مدیر تاییدکننده" })
  @IsNumber()
  approved_by: number;

  @ApiProperty({ description: "نظرات تاییدکننده", required: false })
  @IsOptional()
  @IsString()
  approval_notes?: string;

  @ApiProperty({ description: "امتیاز تعلق گرفته" })
  @IsNumber()
  @Min(0)
  points: number;
}

export class ActivityFilterDto {
  @ApiPropertyOptional({ enum: ActivityType, description: "نوع فعالیت" })
  @IsOptional()
  @IsEnum(ActivityType)
  activity_type?: ActivityType;

  @ApiPropertyOptional({ enum: ActivityStatusEnum, description: "وضعیت فعالیت" })
  @IsOptional()
  @IsEnum(ActivityStatusEnum)
  status?: ActivityStatusEnum;

  @ApiPropertyOptional({ description: "شناسه کاربر" })
  @IsOptional()
  @IsNumber()
  member_id?: number;

  @ApiPropertyOptional({ description: "شناسه واحد" })
  @IsOptional()
  @IsNumber()
  section_code?: number;

  @ApiPropertyOptional({ description: "تاریخ شروع از" })
  @IsJalaliDateTime({ message : "تاریخ وارد شده معتبر نیست" })
  @IsOptional()
  @IsDate()
  from_date?: Date;

  @ApiPropertyOptional({ description: "تاریخ شروع تا" })
  @IsJalaliDateTime({ message : "تاریخ وارد شده معتبر نیست" })
  @IsOptional()
  @IsDate()
  to_date?: Date;

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
