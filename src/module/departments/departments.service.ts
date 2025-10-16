import { ConflictException, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { CommissionEntity } from '../commissions/entities/commission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEntity } from 'src/admin/entities/admin.entity';
import { DepartmentEntity } from './entities/department.entity';
import { MemberEntity } from '../members/entities/members.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({scope : Scope.REQUEST})
export class DepartmentsService {
  constructor(
    @Inject(REQUEST)
    private req : Request,
    @InjectRepository(MemberEntity)
    private readonly memberRepository : Repository<MemberEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository : Repository<DepartmentEntity>,
    @InjectRepository(CommissionEntity)
    private readonly commissionRepository : Repository<CommissionEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository : Repository<AdminEntity>
  ){}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name, commission_id } = createDepartmentDto
    let code = 301;
    if(!(await this.commissionRepository.findOneBy({id : +commission_id}))){
      throw new NotFoundException('کمیسیون یافت نشد.')
    }
    const count = await this.departmentRepository.count()
    if(count && count > 0) code += count 
    if(await this.departmentRepository.findOne({
      where : [
        {name},
        {code}
      ]
    })){
      throw new ConflictException('این شناسه وجود دارد.')
    }
    const role = this.adminRepository.create({
      code,
      role : name
    })
    const { code : role_code } = await this.adminRepository.save(role)
    const commission = this.departmentRepository.create({
      name,
      commission_id : +commission_id,
      code : role_code
    })
    await this.departmentRepository.save(commission)
    return {
      message : "دپارتمان با موفقیت ساخته شد"
    }
  }

  async findAll() {
    const departments = await this.departmentRepository.find({ relations: {
      commission : true,
      members : true, 
      role : {
        member : {
          user : true
        }
      }
    }
  });
    return departments.map(dep => ({
      name : dep.name,
      id : dep.id,
      commission : dep.commission.name,
      commission_id : dep.commission_id,
      head : dep.role.member_id ?
        `${dep?.role?.member?.user?.first_name} ${dep?.role?.member?.user?.last_name}` :
        "مشخص نشده",
      membersCount: dep.members ? dep.members.length : 0,
      members: undefined,
      updated_at : undefined,
      created_at : undefined
    }));
  }

  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where : {
        id
      },
      relations : ['members', 'members.user'],
      select : {members : {
        id : true,
        user : {
          first_name : true,
          last_name : true
        }
      }}
    })
    if(!department)
      throw new NotFoundException('دپارتمان یافت نشذ.')

    return {
      ...department,
      members: department.members
        ? department.members.map(member => ({
            id: member.id,
            name: `${member.user.first_name} ${member.user.last_name}`
          }))
        : []
    }
  }

  async update(updateDepartmentDto: UpdateDepartmentDto) {
    const {department_id, new_name} = updateDepartmentDto;
    const department = await this.checkExist(+department_id)

    department.name = new_name
    await this.departmentRepository.save(department)
    await this.adminRepository.update({code : department.code}, {
      role : new_name
    })
    return {
      message : "دپارتمان با موفقیت اپدیت شد."
    }
  }
  async checkExist(id : number){
    const department = await this.departmentRepository.findOneBy({ id })
    if(!department){
      throw new NotFoundException('دپارتمان یافت نشد.')
    }
    return department
  }
  async addMember(member_id : number, department_id : number){
    let access = false;
    const admin = await this.adminRepository.findOneBy({member_id : this.req.user.member_id})
    const department = await this.departmentRepository.findOne({
      where : {
        id : department_id
      },
      relations : ['commission']
    })
    const member = await this.memberRepository.findOneBy({ id : member_id })

    if(!member)
      throw new NotFoundException('کاربر یافت نشد.')
    if(member.department_id){
      if(member.department_id == department_id)
        throw new ConflictException('کاربر عضو این دپارتمان میباشد.')
      throw new ConflictException('کاریر عضو دپادتمان دیگری است.')
    }

    if(!department){
      throw new NotFoundException('دپارتمان یافت نشد.')
    }
    if(admin.code > 100 && admin.code < 200){
      access = true
    }else if(admin.code > 200 && admin.code < 400){
      if(department.code == admin.code || department.commission.code == admin.code){
        access = true
      }
    }
    if(access){
      member.department_id = department_id
      await this.memberRepository.save(member)
      return {
        message : "کاربر با موفقیت عضو دپارتمان شد."
      }
    }
    throw new UnauthorizedException('دسترسی شما محدود است')
  }

  async remove(id: number) {
    const { code } = await this.checkExist(id)
    await this.departmentRepository.delete({id})
    await this.adminRepository.delete({code : code})
    return {
      message : "دپارتمان با موفقیت حذف شد"
    }
  }
}
