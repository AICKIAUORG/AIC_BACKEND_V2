import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from './entities/department.entity';
import { AdminEntity } from 'src/admin/entities/admin.entity';
import { CommissionEntity } from '../commissions/entities/commission.entity';
import { MemberEntity } from '../members/entities/members.entity';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { AdminService } from 'src/admin/admin.service';
import { UserEntity } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity, AdminEntity, CommissionEntity, MemberEntity, UserEntity]),AuthModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, AdminService],
})
export class DepartmentsModule {}
