import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { AdminEntity } from './entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity, AdminEntity])],
  controllers: [AdminController],
  providers: [AdminService],
  exports : [AdminService]
})
export class AdminModule {}
