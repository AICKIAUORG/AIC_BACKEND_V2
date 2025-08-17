import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from './entities/department.entity';
import { AdminEntity } from 'src/admin/entities/admin.entity';
import { CommissionEntity } from '../commissions/entities/commission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity, AdminEntity, CommissionEntity])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
