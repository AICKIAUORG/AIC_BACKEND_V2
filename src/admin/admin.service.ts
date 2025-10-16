import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { NotFoundError } from 'rxjs';
import { MemberEntity } from 'src/module/members/entities/members.entity';
import { DepartmentEntity } from 'src/module/departments/entities/department.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity) 
    private adminRepository : Repository<AdminEntity>,
    @InjectRepository(DepartmentEntity) 
    private departmentRepository : Repository<DepartmentEntity>,
    @InjectRepository(MemberEntity) 
    private memberRepository : Repository<MemberEntity>,
    @InjectRepository(PermissionEntity) 
    private permissionRepository : Repository<PermissionEntity>
  ){}

  async findAll() {
    const admins = await this.adminRepository.find({
      relations : { member : { user : true } }
    })
    const mappedAdmins = admins
      .map(admin => {
        return {
          code: admin.code,
          role: admin.role,
          head_name: admin.member_id
            ? `${admin?.member?.user?.first_name} ${admin?.member?.user?.last_name}`
            : "مشخص نشده",
          head_id: admin.member_id
            ? admin.member_id
            : "مشخص نشده"
        }
      })
      .sort((a, b) => a.code - b.code);
    return {
      admins : mappedAdmins.length > 0 ? mappedAdmins : []
    }
  }

  async findOne(code: number) {
    const admin = await this.adminRepository.findOne({
      where : { code },
      relations : { member : { user : true } }
    })
    if(!admin)
      throw new NotFoundException('نتیجه ای یافت نشد.')

    return {
      code : admin.code,
      name : admin.role,
      head_name: admin.member_id
        ? `${admin?.member?.user?.first_name} ${admin?.member?.user?.last_name}`
        : "مشخص نشده",
      head_id: admin.member_id
        ? admin.member_id
        : "مشخص نشده"
    }
  }

  async removeAdmin(id: number) {
    const admin = await this.adminRepository.findOne({ 
      where : {
        member_id : id 
      },
      relations : { member : {user : true} }
    })
    if(!admin)
      throw new NotFoundException('نتیجه ای یافت نشد.')
    await this.adminRepository.update({ member_id : id },{ member_id : null })

    return {
      message : `کاربر ${admin?.member?.user?.first_name} ${admin?.member?.user?.last_name} از حالت مدیریت خارج شد`
    }

  }

  async addAdmin(code : number, member_id : number){
    const admin = await this.adminRepository.findOneBy({ code })
    const member = await this.memberRepository.findOne({ 
      where : {
        id : member_id 
      },
      relations : ['role']
    })
    if(!admin)
      throw new NotFoundException('نتیجه ای یافت نشد')

    if(!member)
      throw new NotFoundException('کاربر یافت نشد')

    if(member.role)
      throw new ConflictException(`کاربر مدیر بخش ${member.role.role} میباشد`)

    if(admin.member_id)
      throw new ConflictException('این بخش دارای مدیر میباشد.')

    if(code > 300 && code < 400){
      const department = await this.departmentRepository.findOneBy({ role_code : code })
      if(!department)
        throw new NotFoundException('دپارتمان یافت نشد')
      if(member.department_id && member.department_id === department.id){
        await this.adminRepository.update({ code }, {
            member_id
          }
        )
        return {
          message : `اکنون کاربر مدیر ${department.name} میباشد`
        }
      }else {
        throw new BadRequestException('کاربر باید عضو دپارتمان مورد نظر باشد')
      }
    }

    if(member.department_id){
      throw new ConflictException('کاربر نمیتواند عضو دپارتمانی باشد')
    }

    await this.adminRepository.update({ code }, {
      member_id
    })
    return {
      message : code < 200 ? `اکنون کاربر عضو هییت مدیره با سمت ${admin.role} میباشد` : `اکنون کاربر مدیر ${admin.role} میباشد`
    }
  }
  
  async checkAccess(id: number, role : Number[], permission : Number[]) {
    const member_role = await this.adminRepository.findOneBy({member_id : id})
    const member_permissions = await this.permissionRepository.findOne({
      relations : {members : true},
      where : {
        members : {id}
    }})
    if(permission.length > 0 && permission.includes(member_permissions?.code)) return true
    if(100 < member_role?.code && member_role?.code < 200 && role.includes(100)) return true
    if(200 < member_role?.code && member_role?.code < 300 && role.includes(200)) return true
    if(300 < member_role?.code && member_role?.code < 400 && role.includes(300)) return true
    if(role.includes(member_role?.code)) return true
    return false
  }

  async removeMemberFromDepartment(member_id: number) {
    const memberRepo = this.adminRepository.manager.getRepository('MemberEntity');
    const member = await memberRepo.findOneBy({ id: member_id });
    if (!member) {
      throw new Error('عضو مورد نظر یافت نشد.');
    }
    member.department_id = null;
    await memberRepo.save(member);
    return { message: 'عضویت کاربر از دپارتمان با موفقیت حذف شد.' };
  }
}
