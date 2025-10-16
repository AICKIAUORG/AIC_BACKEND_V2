import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from 'src/admin/entities/admin.entity';
import { CommissionEntity } from './entities/commission.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity, CommissionEntity]),
  AuthModule,
  AdminModule
],
  controllers: [CommissionsController],
  providers: [CommissionsService],
})
export class CommissionsModule {}
