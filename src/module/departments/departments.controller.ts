import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { ApiConsumes, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SwaggerEnums } from 'src/common/enums/swagger.enum';
import { UserAuth } from 'src/common/decorators/auth.decorator';
import { Access } from 'src/common/decorators/roles.decorator';

@Controller('departments')
@ApiTags('Departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create new department',
    description: 'Creates a new department with specified name and commission'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Department created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'دپارتمان با موفقیت ساخته شد' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Commission not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کمیسیون یافت نشد.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Department with this name or code already exists',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'این شناسه وجود دارد.' },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all departments',
    description: 'Returns list of all departments with commission info, head and member count'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Departments retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'دپارتمان فناوری' },
          id: { type: 'number', example: 1 },
          commission: { type: 'string', example: 'کمیسیون فناوری' },
          commission_id: { type: 'number', example: 1 },
          head: { type: 'string', example: 'علی احمدی' },
          membersCount: { type: 'number', example: 5 }
        }
      }
    }
  })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get department details',
    description: 'Returns complete department information including members'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Department details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'دپارتمان فناوری' },
        commission_id: { type: 'number', example: 1 },
        role_code: { type: 'number', example: 301 },
        members: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'علی احمدی' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Department not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'دپارتمان یافت نشذ.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(+id);
  }

  @Patch()
  @ApiOperation({ 
    summary: 'Update department',
    description: 'Updates department name'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Department updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'دپارتمان با موفقیت اپدیت شد.' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Department not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'دپارتمان یافت نشد.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  update(@Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(updateDepartmentDto);
  }

  @UserAuth()
  @Access([100,200,300])
  @Patch('/addMember')
  @ApiOperation({ 
    summary: 'Add member to department',
    description: 'Adds a new member to the department'
  })
  @ApiQuery({ name: 'member_id', description: 'Member ID', type: 'string' })
  @ApiQuery({ name: 'department_id', description: 'Department ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Member added to department successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کاربر با موفقیت عضو دپارتمان شد.' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User or department not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کاربر یافت نشد.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User is already a member of this or another department',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کاربر عضو این دپارتمان میباشد.' },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Access denied',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'دسترسی شما محدود است' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  addMember(@Query('member_id') member_id: string, @Query('department_id') department_id: string) {
    return this.departmentsService.addMember(+member_id, +department_id);
  }

  @UserAuth()
  @Access([100])
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete department',
    description: 'Deletes department and its related role'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Department deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'دپارتمان با موفقیت حذف شد' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Department not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'دپارتمان یافت نشد.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(+id);
  }
}
