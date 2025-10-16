import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerEnums } from 'src/common/enums/swagger.enum';
import { Access } from 'src/common/decorators/roles.decorator';

@Controller('admin')
@ApiTags('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Access([100])
  findAll() {
    return this.adminService.findAll();
  }
  @Access([100])
  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.adminService.findOne(+code);
  }

  @Access([101])
  @Patch('removeAdmin:head_id')
  removeAdmin(@Param('head_id') head_id : string) {
    return this.adminService.removeAdmin(+head_id);
  }

  @Access([101])
  @Patch('addAdmin')
  addAdmin(@Query('code') code: string, @Query('member_id') member_id: string) {
    return this.adminService.addAdmin(+code, +member_id);
  }
  
  @Access([100])
  @Patch('/removeFromDepartment/:member_id')
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  removeFromDepartment(@Param('member_id') member_id: string) {
    return this.adminService.removeMemberFromDepartment(+member_id);
  }
}
