import { Injectable, NotFoundException, BadRequestException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityScoringConfigEntity } from './entities/activity-scoring-config.entity';
import { UserScoreSummaryEntity } from './entities/user-score-summary.entity';
import { CreateActivityDto, UpdateActivityDto, ApproveActivityDto, ActivityFilterDto } from './dto/activity.dto';
import { ActivityType } from 'src/common/enums/activity.enum';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AdminService } from 'src/admin/admin.service';
import { StatusEnum } from 'src/common/enums/status.enum';
import { MembersService } from '../members/members.service';

@Injectable({ scope : Scope.REQUEST })
export class ActivityService {
  constructor(
    @Inject(REQUEST)
    private req : Request,
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
    @InjectRepository(ActivityScoringConfigEntity)
    private scoringConfigRepository: Repository<ActivityScoringConfigEntity>,
    @InjectRepository(UserScoreSummaryEntity)
    private userScoreSummaryRepository: Repository<UserScoreSummaryEntity>,
    private adminService : AdminService,
    private memberService : MembersService,
  ) {}

  async createActivity(createActivityDto: CreateActivityDto): Promise<ActivityEntity> {
    const { points, member_id } = createActivityDto

    if(!await this.memberService.findMemberById(member_id)){
      throw new NotFoundException('کاربر یافت نشد.')
    }

    const access = await this.adminService.checkAccess(this.req.user.id, [100], [])
    if(!access && points > 30){
      throw new BadRequestException('حداکثر امتیاز ۳۰ میباشد.')
    }
    
    const activity = this.activityRepository.create({
      ...createActivityDto,
      status: access ? StatusEnum.accept : StatusEnum.pending,
    });

    return await this.activityRepository.save(activity);
  }

  async findAllActivities(filterDto?: ActivityFilterDto): Promise<ActivityEntity[]> {
    const where: FindOptionsWhere<ActivityEntity> = {};

    if (filterDto?.activity_type) {
      where.activity_type = filterDto.activity_type;
    }
    if (filterDto?.status) {
      where.status = filterDto.status;
    }
    if (filterDto?.user_id) {
      where.user_id = filterDto.user_id;
    }
    if (filterDto?.department_id) {
      where.department_id = filterDto.department_id;
    }
    if (filterDto?.commission_id) {
      where.commission_id = filterDto.commission_id;
    }

    const query = this.activityRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.department', 'department')
      .leftJoinAndSelect('activity.commission', 'commission')
      .leftJoinAndSelect('activity.approver', 'approver')
      .where(where);

    if (filterDto?.start_date_from && filterDto?.start_date_to) {
      query.andWhere('activity.start_date BETWEEN :startDateFrom AND :startDateTo', {
        startDateFrom: filterDto.start_date_from,
        startDateTo: filterDto.start_date_to,
      });
    }

    return await query.getMany();
  }

  async findActivityById(id: number): Promise<ActivityEntity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['user', 'department', 'commission', 'approver'],
    });

    if (!activity) {
      throw new NotFoundException('فعالیت یافت نشد');
    }

    return activity;
  }

  async updateActivity(id: number, updateActivityDto: UpdateActivityDto): Promise<ActivityEntity> {
    const activity = await this.findActivityById(id);

    // اگر وضعیت تغییر کرده و به تایید شده تبدیل شده، امتیازات را بروزرسانی کن
    if (updateActivityDto.status === ActivityStatus.APPROVED && activity.status !== ActivityStatus.APPROVED) {
      await this.updateUserScoreSummary(activity.user_id, activity.points);
    }

    Object.assign(activity, updateActivityDto);
    return await this.activityRepository.save(activity);
  }

  async approveActivity(id: number, approveActivityDto: ApproveActivityDto): Promise<ActivityEntity> {
    const activity = await this.findActivityById(id);

    if (activity.status === ActivityStatus.APPROVED) {
      throw new BadRequestException('فعالیت قبلاً تایید شده است');
    }

    activity.status = ActivityStatus.APPROVED;
    activity.approved_by = approveActivityDto.approved_by;
    activity.approved_at = new Date();
    activity.approval_notes = approveActivityDto.approval_notes;
    activity.points = approveActivityDto.points;

    const savedActivity = await this.activityRepository.save(activity);

    // بروزرسانی امتیازات کاربر
    await this.updateUserScoreSummary(activity.user_id, activity.points);

    return savedActivity;
  }

  async rejectActivity(id: number, approvedBy: number, rejectionNotes?: string): Promise<ActivityEntity> {
    const activity = await this.findActivityById(id);

    activity.status = ActivityStatus.REJECTED;
    activity.approved_by = approvedBy;
    activity.approved_at = new Date();
    activity.approval_notes = rejectionNotes;

    return await this.activityRepository.save(activity);
  }

  async deleteActivity(id: number): Promise<void> {
    const activity = await this.findActivityById(id);

    if (activity.status === ActivityStatus.APPROVED) {
      // اگر فعالیت تایید شده بود، امتیازات را کم کن
      await this.updateUserScoreSummary(activity.user_id, -activity.points);
    }

    await this.activityRepository.remove(activity);
  }

  async getUserActivities(userId: number): Promise<ActivityEntity[]> {
    return await this.activityRepository.find({
      where: { user_id: userId },
      relations: ['department', 'commission', 'approver'],
      order: { created_at: 'DESC' },
    });
  }

  async getUserScoreSummary(userId: number): Promise<UserScoreSummaryEntity> {
    let summary = await this.userScoreSummaryRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!summary) {
      // ایجاد خلاصه امتیازات اگر وجود نداشته باشد
      summary = await this.createUserScoreSummary(userId);
    }

    return summary;
  }

  async getTopUsers(limit: number = 10): Promise<UserScoreSummaryEntity[]> {
    return await this.userScoreSummaryRepository.find({
      relations: ['user'],
      order: { total_points: 'DESC' },
      take: limit,
    });
  }

  async getDepartmentActivities(departmentId: number): Promise<ActivityEntity[]> {
    return await this.activityRepository.find({
      where: { department_id: departmentId },
      relations: ['user', 'approver'],
      order: { created_at: 'DESC' },
    });
  }

  async getCommissionActivities(commissionId: number): Promise<ActivityEntity[]> {
    return await this.activityRepository.find({
      where: { commission_id: commissionId },
      relations: ['user', 'department', 'approver'],
      order: { created_at: 'DESC' },
    });
  }

  async getActivityStatistics(): Promise<any> {
    const totalActivities = await this.activityRepository.count();
    const approvedActivities = await this.activityRepository.count({
      where: { status: ActivityStatus.APPROVED },
    });
    const pendingActivities = await this.activityRepository.count({
      where: { status: ActivityStatus.PENDING },
    });

    const totalPoints = await this.activityRepository
      .createQueryBuilder('activity')
      .select('SUM(activity.points)', 'total')
      .where('activity.status = :status', { status: ActivityStatus.APPROVED })
      .getRawOne();

    const activitiesByType = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.activity_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('activity.activity_type')
      .getRawMany();

    return {
      totalActivities,
      approvedActivities,
      pendingActivities,
      totalPoints: parseInt(totalPoints.total) || 0,
      activitiesByType,
    };
  }
}