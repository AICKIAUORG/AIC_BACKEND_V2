import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity) 
    private adminRepository : Repository<AdminEntity>,
    @InjectRepository(PermissionEntity) 
    private permissionRepository : Repository<PermissionEntity>
  ){}
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  async findAll() {
    const admins = await this.adminRepository.find({
      relations : { member : { user : true } }
    })
    const mappedAdmins = admins
      .map(admin => {
        return {
          code: admin.code,
          name: admin.role,
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
    
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  async checkAccess(id: number, role : Number[], permission : Number[]) {
    const user_role = await this.adminRepository.findOneBy({member_id : id})
    const user_permissions = await this.permissionRepository.findOne({
      relations : {members : true},
      where : {
        members : {id}
    }})
    console.log(id);
    console.log(user_role.code);
    if(permission.includes(user_permissions?.code)) return true
    if(100 < user_role?.code && user_role?.code < 200 && role.includes(100)) return true
    if(200 < user_role?.code && user_role?.code < 300 && role.includes(200)) return true
    if(300 < user_role?.code && user_role?.code < 400 && role.includes(300)) return true
    if(role.includes(user_role?.code)) return true
    return false
  }

  async removeMemberFromDepartment(memberId: number) {
    const memberRepo = this.adminRepository.manager.getRepository('MemberEntity');
    const member = await memberRepo.findOneBy({ id: memberId });
    if (!member) {
      throw new Error('عضو مورد نظر یافت نشد.');
    }
    member.department_id = null;
    await memberRepo.save(member);
    return { message: 'عضویت عضو از دپارتمان با موفقیت حذف شد.' };
  }
}
