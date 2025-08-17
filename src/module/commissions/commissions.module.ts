import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from 'src/admin/entities/admin.entity';
import { CommissionEntity } from './entities/commission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity, CommissionEntity])],
  controllers: [CommissionsController],
  providers: [CommissionsService],
})
export class CommissionsModule {}
