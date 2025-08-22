import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerEnums } from 'src/common/enums/swagger.enum';

@Controller('admin')
@ApiTags('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.adminService.findOne(+code);
  }

  @Patch('removeAdmin:head_id')
  removeAdmin(@Param('head_id') head_id : string) {
    return this.adminService.removeAdmin(+head_id);
  }

  @Patch('addAdmin')
  addAdmin(@Query('code') code: string, @Query('member_id') member_id: string) {
    return this.adminService.addAdmin(+code, +member_id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
  
  @Patch('/removeFromDepartment/:member_id')
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  removeFromDepartment(@Param('member_id') member_id: string) {
    return this.adminService.removeMemberFromDepartment(+member_id);
  }
}
