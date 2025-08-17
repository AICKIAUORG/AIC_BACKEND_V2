import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
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

  findAll() {
    return `This action returns all commissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commission`;
  }

  update(id: number, updateCommissionDto: UpdateCommissionDto) {
    return `This action updates a #${id} commission`;
  }

  remove(id: number) {
    return `This action removes a #${id} commission`;
  }
}
