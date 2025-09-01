import { ActivityType } from "src/common/enums/activity.enum";
import { IsEnum, IsString, IsNumber, IsOptional, IsDate, IsBoolean, IsObject, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StatusEnum } from "src/common/enums/status.enum";

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, description: "نوع فعالیت" })
  @IsEnum(ActivityType)
  activity_type: ActivityType;

  @ApiProperty({ description: "توضیحات فعالیت" })
  @IsString()
  description: string;

  @ApiProperty({ description: "امتیاز تعلق گرفته", required: false, default : 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiProperty({ description: "شناسه کاربر دریافت‌کننده امتیاز" })
  @IsNumber()
  member_id: number;
}

export class UpdateActivityDto {
  @ApiProperty({ enum: StatusEnum, description: "وضعیت فعالیت", required: false })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;

  @ApiProperty({ description: "امتیاز تعلق گرفته", required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiProperty({ description: "شناسه مدیر تاییدکننده", required: false })
  @IsOptional()
  @IsNumber()
  approved_by?: number;

  @ApiProperty({ description: "نظرات تاییدکننده", required: false })
  @IsOptional()
  @IsString()
  approval_notes?: string;
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
  @ApiProperty({ enum: ActivityType, description: "نوع فعالیت", required: false })
  @IsOptional()
  @IsEnum(ActivityType)
  activity_type?: ActivityType;

  @ApiProperty({ enum: StatusEnum, description: "وضعیت فعالیت", required: false })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;

  @ApiProperty({ description: "شناسه کاربر", required: false })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: "شناسه دپارتمان", required: false })
  @IsOptional()
  @IsNumber()
  department_id?: number;

  @ApiProperty({ description: "شناسه کمیسیون", required: false })
  @IsOptional()
  @IsNumber()
  commission_id?: number;

  @ApiProperty({ description: "تاریخ شروع از", required: false })
  @IsOptional()
  @IsDate()
  start_date_from?: Date;

  @ApiProperty({ description: "تاریخ شروع تا", required: false })
  @IsOptional()
  @IsDate()
  start_date_to?: Date;
}
