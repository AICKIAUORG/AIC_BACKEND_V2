import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { AdminEntity } from './entities/admin.entity';
import { MemberEntity } from 'src/module/members/entities/members.entity';
import { DepartmentEntity } from 'src/module/departments/entities/department.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionEntity, AdminEntity, MemberEntity, DepartmentEntity]),
    AuthModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports : [AdminService, AdminModule]
})
export class AdminModule {}
