import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/create-department.dto';
import { CommissionEntity } from '../commissions/entities/commission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEntity } from 'src/admin/entities/admin.entity';
import { DepartmentEntity } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
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
    const commission = this.departmentRepository.create({
      name,
      commission_id : +commission_id,
      role_code
    })
    await this.departmentRepository.save(commission)
    return {
      message : "دپارتمان با موفقیت ساخته شد"
    }
  }

  async findAll() {
    const departments = await this.departmentRepository.find({ relations: ['members'] });
    return departments.map(dep => ({
      ...dep,
      membersCount: dep.members ? dep.members.length : 0,
      members: undefined 
    }));

  }

  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where : {
        id
      },
      relations : ['members'],
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
    const department = await this.departmentRepository.findOneBy({id : +department_id})
    if(!department){
      throw new NotFoundException('دپارتمان یافت نشد.')
    }
    department.name = new_name
    await this.departmentRepository.save(department)
    await this.adminRepository.update({code : department.role_code}, {
      role : new_name
    })
    return {
      message : "دپارتمان با موفقیت اپدیت شد."
    }
  }

  remove(id: number) {
    return `This action removes a #${id} department`;
  }
}
