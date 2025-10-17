import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiConsumes, ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SwaggerEnums } from 'src/common/enums/swagger.enum';
import { Access } from 'src/common/decorators/roles.decorator';
import { UserAuth } from 'src/common/decorators/auth.decorator';

@Controller('admin')
@ApiTags('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @UserAuth()
  @Access([100])
  @ApiOperation({
    summary: 'Get all admins',
    description: 'Returns list of all admins with their roles and assigned members'
  })
  @ApiResponse({
    status: 200,
    description: 'Admins retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        admins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'number', example: 100 },
              role: { type: 'string', example: 'مدیر کل' },
              head_name: { type: 'string', example: 'علی احمدی' },
              head_id: { type: 'number', example: 1 }
            }
          }
        }
      }
    }
  })
  findAll() {
    return this.adminService.findAll();
  }
  @Access([100])
  @Get(':code')
  @ApiOperation({
    summary: 'Get admin by code',
    description: 'Returns admin details by admin code'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 100 },
        name: { type: 'string', example: 'مدیر کل' },
        head_name: { type: 'string', example: 'علی احمدی' },
        head_id: { type: 'number', example: 1 }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'نتیجه ای یافت نشد.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  findOne(@Param('code') code: string) {
    return this.adminService.findOne(+code);
  }

  @Access([101])
  @Patch('removeAdmin:head_id')
  @ApiOperation({
    summary: 'Remove admin',
    description: 'Removes admin role from a member'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin removed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کاربر علی احمدی از حالت مدیریت خارج شد' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'نتیجه ای یافت نشد.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  removeAdmin(@Param('head_id') head_id : string) {
    return this.adminService.removeAdmin(+head_id);
  }

  @Access([101])
  @Patch('addAdmin')
  @ApiOperation({
    summary: 'Add admin',
    description: 'Assigns admin role to a member'
  })
  @ApiQuery({ name: 'code', description: 'Admin role code', type: 'string' })
  @ApiQuery({ name: 'member_id', description: 'Member ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Admin added successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'اکنون کاربر عضو هییت مدیره با سمت مدیر کل میباشد' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Admin role or member not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'نتیجه ای یافت نشد' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Member already has admin role or position already occupied',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کاربر مدیر بخش برنامه‌نویسی میباشد' },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Member must be part of the department or cannot be department member',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کاربر باید عضو دپارتمان مورد نظر باشد' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  addAdmin(@Query('code') code: string, @Query('member_id') member_id: string) {
    return this.adminService.addAdmin(+code, +member_id);
  }
  
  @Access([100])
  @Patch('/removeFromDepartment/:member_id')
  @ApiOperation({
    summary: 'Remove member from department',
    description: 'Removes a member from their department'
  })
  @ApiResponse({
    status: 200,
    description: 'Member removed from department successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'عضویت کاربر از دپارتمان با موفقیت حذف شد.' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'عضو مورد نظر یافت نشد.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  removeFromDepartment(@Param('member_id') member_id: string) {
    return this.adminService.removeMemberFromDepartment(+member_id);
  }

  // @Access([101])
  @Patch('addPermission')
  @ApiOperation({
    summary: 'Add permission to member',
    description: 'Adds a specific permission to a member'
  })
  @ApiQuery({ name: 'code', description: 'Permission code', type: 'string' })
  @ApiQuery({ name: 'member_id', description: 'Member ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Permission added successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'دسترسی ایجاد گزارش به کاربر اضافه شد' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Permission or member not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'نتیجه ای یافت نشد' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Permission already exists',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'این دسترسی قبلاً به کاربر داده شده است' },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  addPermission(@Query('code') code: string, @Query('member_id') member_id: string) {
    return this.adminService.addPermission(+code, +member_id);
  }

  // @Access([101])
  @Patch('removePermission')
  @ApiOperation({
    summary: 'Remove permission from member',
    description: 'Removes a specific permission from a member'
  })
  @ApiQuery({ name: 'code', description: 'Permission code', type: 'string' })
  @ApiQuery({ name: 'member_id', description: 'Member ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Permission removed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'دسترسی ایجاد گزارش از کاربر حذف شد' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Permission or member not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'این دسترسی به کاربر داده نشده است' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  removePermission(@Query('code') code: string, @Query('member_id') member_id: string) {
    return this.adminService.removePermission(+code, +member_id);
  }

  // @Access([100, 101])
  @Get('permissions/:member_id')
  @ApiOperation({
    summary: 'Get member permissions',
    description: 'Returns all permissions assigned to a specific member'
  })
  @ApiResponse({
    status: 200,
    description: 'Member permissions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        member_id: { type: 'number', example: 1 },
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'number', example: 1001 },
              permission: { type: 'string', example: 'ایجاد گزارش' },
              access: { type: 'string', example: 'read' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کاربر یافت نشد' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  getUserPermissions(@Param('member_id') member_id: string) {
    return this.adminService.getUserPermissions(+member_id);
  }
}
