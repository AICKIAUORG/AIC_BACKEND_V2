import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommissionDto, UpdateCommissionDto } from './dto/commission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommissionEntity } from './entities/commission.entity';
import { Repository } from 'typeorm';
import { AdminEntity } from 'src/admin/entities/admin.entity';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(CommissionEntity)
    private readonly commissionRepository : Repository<CommissionEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository : Repository<AdminEntity>
  ){}

  async create(createCommissionDto: CreateCommissionDto) {
    const { name } = createCommissionDto
    let code = 201;
    const count = await this.commissionRepository.count()
    if(count && count > 0) code += count 
    if(await this.commissionRepository.findOne({
      where : [
        {name},
        {role_code : code}
      ]
    })){
      throw new ConflictException('این شناسه وجود دارد.')
    }
    const role = this.adminRepository.create({
      code,
      role : name
    })
    const { code : role_code } = await this.adminRepository.save(role)
    const commission = this.commissionRepository.create({
      name,
      role_code
    })
    await this.commissionRepository.save(commission)
    return {
      message : "کمیسیون با موفقیت ساخته شد"
    }
  }

  async findAll() {
    const commissions = await this.commissionRepository.find({ relations: {
       departments : {
          members : true,
          role : {
          member : {
            user : true
          }
        } 
      }, role : {
        member : {
          user : true
        }
      }
    }
  });
    return commissions.map(commissions => ({
      name : commissions.name,
      head : commissions.role.member_id ?
       `${commissions?.role?.member?.user?.first_name} ${commissions?.role?.member?.user?.last_name}` :
       "مشخص نشده",
      id : commissions.id,
      departments: commissions.departments.map(dep => {
        return {
          name : dep.name,
          head : dep.role.member_id ?
            `${dep?.role?.member?.user?.first_name} ${dep?.role?.member?.user?.last_name}` :
            "مشخص نشده",
          department_id : dep.id,
          membersCount: dep.members ? dep.members.length : 0
        }
      }),
    }));
  }
  async findOne(id: number) {
    const commissions = await this.commissionRepository.findOne({
      where : {
        id
      },
      relations: {
        departments : {
           members : true,
           role : {
           member : {
             user : true
           }
         } 
        }, role : {
          member : {
            user : true
          }
        }
      }
    })
    if(!commissions)
      throw new NotFoundException('کمیسیون یافت نشذ.')

    return {
      name : commissions.name,
      head : commissions.role.member_id ?
       `${commissions?.role?.member?.user?.first_name} ${commissions?.role?.member?.user?.last_name}` :
       "مشخص نشده",
      id : commissions.id,
      departments: commissions.departments.map(dep => {
        return {
          name : dep.name,
          head : dep.role.member_id ?
            `${dep?.role?.member?.user?.first_name} ${dep?.role?.member?.user?.last_name}` :
            "مشخص نشده",
          department_id : dep.id,
          membersCount: dep.members ? dep.members.length : 0
        }
      }),
    };
  }

  async update(updateCommissionDto: UpdateCommissionDto) {
    const {commission_id, new_name} = updateCommissionDto;
    const commission = await this.checkExist(+commission_id)

    commission.name = new_name
    await this.commissionRepository.save(commission)
    await this.adminRepository.update({code : commission.role_code}, {
      role : new_name
    })
    return {
      message : "کمیسیون با موفقیت اپدیت شد."
    }
  }
  async checkExist(id : number){
    const commission = await this.commissionRepository.findOneBy({ id })
    if(!commission){
      throw new NotFoundException('کمیسیون یافت نشد.')
    }
    return commission
  }

  async remove(id: number) {
    const { role_code } = await this.checkExist(id)
    await this.commissionRepository.delete({id})
    await this.adminRepository.delete({code : role_code})
    return {
      message : "کمیسیون با موفقیت حذف شد"
    }
  }
}
