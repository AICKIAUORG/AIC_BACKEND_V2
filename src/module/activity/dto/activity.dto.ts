import { ActivityType } from "src/common/enums/activity.enum";
import { IsEnum, IsString, IsNumber, IsOptional, IsDate, IsBoolean, IsObject, Min, Max } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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
  @ApiPropertyOptional({ enum: ActivityType, description: "نوع فعالیت" })
  @IsOptional()
  @IsEnum(ActivityType)
  activity_type?: ActivityType;

  @ApiPropertyOptional({ enum: StatusEnum, description: "وضعیت فعالیت" })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;

  @ApiPropertyOptional({ description: "شناسه کاربر" })
  @IsOptional()
  @IsNumber()
  member_id?: number;

  @ApiPropertyOptional({ description: "شناسه واحد" })
  @IsOptional()
  @IsNumber()
  section_code?: number;

  @ApiPropertyOptional({ description: "تاریخ شروع از" })
  @IsOptional()
  @IsDate()
  start_date_from?: Date;

  @ApiPropertyOptional({ description: "تاریخ شروع تا" })
  @IsOptional()
  @IsDate()
  start_date_to?: Date;
}
