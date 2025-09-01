import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { AdminService } from 'src/admin/admin.service';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, AdminService],
})
export class ActivityModule {}
