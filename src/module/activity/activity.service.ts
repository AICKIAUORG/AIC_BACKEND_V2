import { Injectable, NotFoundException, BadRequestException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { CreateActivityDto, ApproveActivityDto, ActivityFilterDto, WarningDto, ChangeActivityStatusDto } from './dto/activity.dto';
import { ActivityStatusEnum, ActivityType } from 'src/common/enums/activity.enum';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AdminService } from 'src/admin/admin.service';
import { MembersService } from '../members/members.service';
import { DateConvertor, PaginationGenerator, paginationSolver } from 'src/common/utility/function.utils';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MemberEntity } from '../members/entities/members.entity';
import { AdminEntity } from 'src/admin/entities/admin.entity';

@Injectable({ scope : Scope.REQUEST })
export class ActivityService {
  constructor(
    @Inject(REQUEST)
    private req : Request,
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
    @InjectRepository(AdminEntity)
    private adminRepository: Repository<AdminEntity>,
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
    const { code } = await this.adminRepository.findOneBy({member_id : this.req.user.member_id})
    const isAdmin = code > 100 && code < 200;

    if(!isAdmin && points > 30){
      throw new BadRequestException('حداکثر امتیاز ۳۰ میباشد.')
    }
    const activity = this.activityRepository.create({
      ...createActivityDto,
      section_code : code,
      status: isAdmin ? ActivityStatusEnum.approve : ActivityStatusEnum.pending,
    });
    if(isAdmin){
      await this.updateMemberPoints(member_id, points)
    }
    await this.activityRepository.save(activity);
    return {
      message : isAdmin ? "امتیاز به کاربر تعلق گرفت." : "فعالیت ثبت و در انتظار تایید قرار گرفت."
    }
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
      .leftJoinAndSelect('activities.member', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('activities.approver', 'approver')
      .leftJoinAndSelect('approver.user', 'approverUser')
      .where(where);

    if (to_date && from_date) {
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

    query.take(limit);
    query.skip(skip);
    query.orderBy("activities.created_at", "DESC");
    
    const [activities, count] = await query.getManyAndCount();
    if (activities.length == 0) throw new NotFoundException("نتیحه ای یافت نشد.");
    const simplifiedActivities = activities.map(activity => ({
        id: activity.id,
        activity_type: activity.activity_type,
        description: activity.description,
        status: activity.status,
        points: activity.points,
        member_id: activity.member_id,
        member_fullName : `${activity.member?.user?.first_name || ''} ${activity.member?.user?.last_name || ''}`,
        section_code: activity.section_code,
        approved_by: activity.approved_by,
        approver_fullName : `${activity.approver?.user?.first_name || ''} ${activity.approver?.user?.last_name || ''}`,
        approved_at: activity.approved_at,
        approval_notes: activity.approval_notes,
        created_at: DateConvertor(activity.created_at, false)
    }));
    
    return {
      pagination: PaginationGenerator(page, limit, count),
      activities: simplifiedActivities,
    };
  }

  async findActivityById(id: number) {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['member.user', 'approver.user'],
    });

    if (!activity) {
      throw new NotFoundException('فعالیت یافت نشد');
    }
    return {
      id: activity.id,
      activity_type: activity.activity_type,
      description: activity.description,
      status: activity.status,
      points: activity.points,
      member_id: activity.member_id,
      member_fullName : `${activity.member?.user?.first_name || ''} ${activity.member?.user?.last_name || ''}`,
      section_code: activity.section_code,
      approved_by: activity.approved_by,
      approver_fullName : `${activity.approver?.user?.first_name || ''} ${activity.approver?.user?.last_name || ''}`,
      approved_at: activity.approved_at,
      approval_notes: activity.approval_notes,
      created_at: DateConvertor(activity.created_at, false)
    };
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
  async changeActivityStatus(id: number, changeActivityStatus: ChangeActivityStatusDto) {
    const activity = await this.activityRepository.findOneBy({ id });
    const { notes, status } = changeActivityStatus;

    if (activity.status !== ActivityStatusEnum.pending) {
      throw new BadRequestException('فعالیت قبلا تعیین وضعیت شده است');
    }

    activity.status = status;
    activity.approved_by = this.req.user.member_id
    activity.approved_at = new Date();
    if(status === ActivityStatusEnum.reject && !notes)
      throw new BadRequestException('‍برای رد کردن فعالیت وارد کردن دلیل ضروری است.')
    if(notes) 
      activity.approval_notes = notes;

    await this.activityRepository.save(activity);
    await this.updateMemberPoints(activity.member_id, activity.points);
    return {
      message : "امتیاز به کاریر تعلق گرفت."
    };
  }
  
  async CreateWarning(warningDto: WarningDto) {
    const { notes, member_id, warning_type } = warningDto;
    const activity = this.activityRepository.create({
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
    const activity = await this.activityRepository.findOneBy({ id });
    
    if(activity.status !== ActivityStatusEnum.approve)
      throw new BadRequestException('فقط فعالیت های تایید شده قابل یازپس گیری هستند.')
    activity.status = ActivityStatusEnum.revoke;
    activity.approved_by = this.req.user.member_id;
    activity.approved_at = new Date();
    activity.approval_notes = null;

    await this.activityRepository.save(activity);
    await this.updateMemberPoints(activity.member_id, -activity.points);
    return {
      message : "امتیاز کاریر بازپس گرفته شد."
    };
  }

  async getUserActivities(member_id: number) {
    const statuses = [
      ActivityStatusEnum.approve,
      ActivityStatusEnum.pending,
      ActivityStatusEnum.WARNING 
    ];

    const activities = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.member_id = :member_id', { member_id })
      .andWhere('activity.status IN (:...statuses)', { statuses })
      .orderBy('activity.created_at', 'DESC')
      .getMany();

    const groupedActivities = activities.reduce((acc, activity) => {
      const status = activity.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push({
        id: activity.id,
        activity_type: activity.activity_type,
        description: activity.description,
        status: activity.status,
        points: activity.points,
        section_code: activity.section_code,
        created_at: DateConvertor(activity.created_at, false)
      });
      return acc;
    }, {});

    const result = Object.keys(groupedActivities).map(status => ({
      status,
      activities: groupedActivities[status]
    }));

    return result;
  }

  async getTopUsers(limit: number = 10) {
    const topUsers = await this.activityRepository
      .createQueryBuilder('activity')
      .innerJoinAndSelect('activity.member', 'member')
      .innerJoinAndSelect('member.user', 'user')
      .select('activity.member_id', 'member_id')
      .addSelect("CONCAT(user.first_name, ' ', user.last_name)", 'full_name')
      .addSelect('SUM(activity.points)', 'total_points')
      .groupBy('activity.member_id')
      .addGroupBy('member.id')
      .addGroupBy('full_name')
      .orderBy('total_points', 'DESC')
      .limit(limit)
      .getRawMany();

    return topUsers;
  }

  async getActivityStatistics(member_id : number) {
    const approvedActivities = await this.activityRepository.count({
      where: [
        { member_id, status: ActivityStatusEnum.approve }
      ]
    })
    const rejectedActivities = await this.activityRepository.count({
      where: [
        { member_id, status: ActivityStatusEnum.reject },
        { member_id, status: ActivityStatusEnum.revoke }
      ],
    });
    const warnings = await this.activityRepository.count({
      where: [
        { member_id, status: ActivityStatusEnum.WARNING }
      ]
    });
    const pendingActivities = await this.activityRepository.count({
      where: [
        { member_id, status: ActivityStatusEnum.pending }
      ]
    });
    return {
      pendingActivities,
      approvedActivities,
      rejectedActivities,
      warnings
    };
  }
}