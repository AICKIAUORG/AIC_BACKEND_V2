import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from '../members/entities/members.entity';
import { ActivityEntity } from './entities/activity.entity';
import { AdminEntity } from 'src/admin/entities/admin.entity';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { AdminModule } from 'src/admin/admin.module';
import { MembersModule } from '../members/members.module';
import { PermissionEntity } from 'src/admin/entities/permission.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberEntity, ActivityEntity, AdminEntity]), 
    MembersModule,
    AdminModule,
    AuthModule
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
