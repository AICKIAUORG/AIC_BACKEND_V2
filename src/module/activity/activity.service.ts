import { Injectable, NotFoundException, BadRequestException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { CreateActivityDto, UpdateActivityDto, ApproveActivityDto, ActivityFilterDto, WarningDto } from './dto/activity.dto';
import { ActivityStatusEnum, ActivityType } from 'src/common/enums/activity.enum';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AdminService } from 'src/admin/admin.service';
import { MembersService } from '../members/members.service';
import { DateConvertor, PaginationGenerator, paginationSolver } from 'src/common/utility/function.utils';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MemberEntity } from '../members/entities/members.entity';

@Injectable({ scope : Scope.REQUEST })
export class ActivityService {
  constructor(
    @Inject(REQUEST)
    private req : Request,
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    private adminService : AdminService,
    private memberService : MembersService,
  ) {}

  async createActivity(createActivityDto: CreateActivityDto) {
    const { points, member_id } = createActivityDto

    if(!await this.memberService.findMemberById(member_id)){
      throw new NotFoundException('کاربر یافت نشد.')
    }

    const access = await this.adminService.checkAccess(this.req.user.member_id, [100], [])
    if(!access && points > 30){
      throw new BadRequestException('حداکثر امتیاز ۳۰ میباشد.')
    }
    
    const activity = this.activityRepository.create({
      ...createActivityDto,
      status: access ? ActivityStatusEnum.approve : ActivityStatusEnum.pending,
    });

    return await this.activityRepository.save(activity);
  }

  async findAllActivities(paginationDto: PaginationDto, filterDto?: ActivityFilterDto) {
    const where: FindOptionsWhere<ActivityEntity> = {};
    const { to_date, from_date } = filterDto
    const { page, limit, skip } = paginationSolver(paginationDto);

    if (filterDto?.activity_type) {
      where.activity_type = filterDto.activity_type;
    }
    if (filterDto?.status) {
      where.status = filterDto.status;
    }
    if (filterDto?.member_id) {
      where.member_id = filterDto.member_id;
    }
    if (filterDto?.section_code) {
      where.section_code = filterDto.section_code;
    }

    const query = this.activityRepository.createQueryBuilder('activities')
      .leftJoinAndSelect('activities.member.user', 'member')
      .leftJoinAndSelect('activities.approver', 'approver')
      .where(where);

      if (
        to_date &&
        from_date
      ) {
        const to = new Date(DateConvertor(to_date))
        const from = new Date(DateConvertor(from_date))
        query.andWhere("activities.created_at BETWEEN :from AND :to", { from, to });
      } else if (from_date) {
        const from = new Date(DateConvertor(from_date))
        query.andWhere("activities.created_at >= :from", { from });
      } else if (to_date) {
        const to = new Date(DateConvertor(to_date))
        query.andWhere("activities.created_at <= :to", { to });
      }
    query.select([
        "activities.id",
        "activities.title",
        "activities.activity_type",
        "activities.description",
        "activities.status",
        "activities.points",
        "activities.member_id",
        "member.first_name",
        "member.last_name",
        "activities.section_code",
        "activities.approved_by",
        "approver.first_name",
        "approver.last_name",
        "activities.approved_at",
        "activities.approval_notes",
        "activities.created_at",
    ])
    query.take(limit);
    query.skip(skip);
    query.orderBy("members.created_at", "DESC");
    const [activities, count] = await query.getManyAndCount();
    if (activities.length == 0) throw new NotFoundException("نتیحه ای یافت نشد.");
    const simplifiedActivities = activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        activity_type: activity.activity_type,
        description: activity.description,
        status: activity.status,
        points: activity.points,
        member_id: activity.member_id,
        member_fullName : `${activity.member.user.first_name} ${activity.member.user.last_name}`,
        section_code: activity.section_code,
        approved_by: activity.approved_by,
        approver_fullName : `${activity.approver.user.first_name} ${activity.approver.user.last_name}`,
        approved_at: activity.approved_at,
        approval_notes: activity.approval_notes,
        created_at: DateConvertor(activity.created_at, false)
    }));
    
    return {
      pagination: PaginationGenerator(page, limit, count),
      activities: simplifiedActivities,
    };
  }

  async findActivityById(id: number): Promise<ActivityEntity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['member', 'approver'],
    });

    if (!activity) {
      throw new NotFoundException('فعالیت یافت نشد');
    }
    return activity;
  }

  // async updateActivity(id: number, updateActivityDto: UpdateActivityDto): Promise<ActivityEntity> {
  //   const activity = await this.findActivityById(id);

  //   // اگر وضعیت تغییر کرده و به تایید شده تبدیل شده، امتیازات را بروزرسانی کن
  //   if (updateActivityDto.status === ActivityStatus.APPROVED && activity.status !== ActivityStatus.APPROVED) {
  //     await this.updateUserScoreSummary(activity.user_id, activity.points);
  //   }

  //   Object.assign(activity, updateActivityDto);
  //   return await this.activityRepository.save(activity);
  // }

  async updateMemberPoints(member_id : number, points : number){
    const member = await this.memberRepository.findOneBy({id : member_id})
    if(!member)
      throw new NotFoundException('کاربر یافت نشد.')
    member.points += points
    await this.memberRepository.save(member)
    return true
  }
  async updateActivity(id: number, updateActivityDto: UpdateActivityDto) {
    const activity = await this.findActivityById(id);
    const { notes, status } = updateActivityDto;

    if (activity.status === ActivityStatusEnum.approve) {
      throw new BadRequestException('فعالیت قبلاً تایید شده است');
    }
    activity.status = status;
    activity.approved_by = this.req.user.member_id
    activity.approved_at = new Date();
    if(status === ActivityStatusEnum.reject && !notes)
      throw new BadRequestException('‍برای رد کردن فعالیت وارد کردن دلیل ضروری است.')
    if(notes) 
      activity.approval_notes = notes;

    await Promise.all([
      this.activityRepository.save(activity),
      this.updateMemberPoints(activity.member_id, activity.points)
    ])

    return {
      message : "امتیاز به کاریر تعلق گرفت."
    };
  }
  
  async CreateWarning(warningDto: WarningDto) {
    const { notes, member_id, warning_type } = warningDto;
    const activity = this.activityRepository.create({
      title : "اخطار",
      activity_type : warning_type,
      description : notes,
      member_id,
      section_code : 100,
      approved_by : this.req.user.member_id,
      status: ActivityStatusEnum.WARNING
    });

    await this.activityRepository.save(activity);

    return {
      message : "اخطار به کاربر تعلق گرفت."
    }
  }
  async revokeActivity(id: number) {
    const activity = await this.findActivityById(id);
    
    if(activity.status !== ActivityStatusEnum.approve)
      throw new BadRequestException('فقط فعالیت های تایید شده قابل یازپس گیری هستند.')
    activity.status = ActivityStatusEnum.revoke;
    activity.approved_by = this.req.user.member_id;
    activity.approved_at = new Date();
    activity.approval_notes = null;

    await Promise.all([
      this.activityRepository.save(activity),
      this.updateMemberPoints(activity.member_id, -activity.points)
    ])

    return {
      message : "امتیاز کاریر بازپس گرفته شد."
    };
  }

  async getUserActivities(userId: number): Promise<ActivityEntity[]> {
    return await this.activityRepository.find({
      where: { user_id: userId },
      relations: ['department', 'commission', 'approver'],
      order: { created_at: 'DESC' },
    });
  }

  async getTopUsers(limit: number = 10): Promise<UserScoreSummaryEntity[]> {
    return await this.userScoreSummaryRepository.find({
      relations: ['user'],
      order: { total_points: 'DESC' },
      take: limit,
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