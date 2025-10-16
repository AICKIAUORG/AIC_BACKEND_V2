import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto, UpdateCommissionDto } from './dto/commission.dto';
import { ApiConsumes, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SwaggerEnums } from 'src/common/enums/swagger.enum';
import { Access } from 'src/common/decorators/roles.decorator';
import { UserAuth } from 'src/common/decorators/auth.decorator';

@Controller('commissions')
@ApiTags('Commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post()
  @UserAuth()
  @Access([101])
  @ApiOperation({ 
    summary: 'Create new commission',
    description: 'Creates a new commission with specified name'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Commission created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کمیسیون با موفقیت ساخته شد' }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Commission with this name or code already exists',
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
  create(@Body() createCommissionDto: CreateCommissionDto) {
    return this.commissionsService.create(createCommissionDto);
  }

  @Get()
  @UserAuth()
  @ApiOperation({ 
    summary: 'Get all commissions',
    description: 'Returns list of all commissions with departments info, head and member count'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Commissions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'کمیسیون فناوری' },
          id: { type: 'number', example: 1 },
          head: { type: 'string', example: 'علی احمدی' },
          departments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'دپارتمان فناوری' },
                department_id: { type: 'number', example: 1 },
                head: { type: 'string', example: 'علی احمدی' },
                membersCount: { type: 'number', example: 5 }
              }
            }
          }
        }
      }
    }
  })
  findAll() {
    return this.commissionsService.findAll();
  }

  @Get(':id')
  @UserAuth()
  @ApiOperation({ 
    summary: 'Get commission details',
    description: 'Returns complete commission information including departments and members'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Commission details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'کمیسیون فناوری' },
        id: { type: 'number', example: 1 },
        head: { type: 'string', example: 'علی احمدی' },
        departments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'دپارتمان فناوری' },
              department_id: { type: 'number', example: 1 },
              head: { type: 'string', example: 'علی احمدی' },
              membersCount: { type: 'number', example: 5 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Commission not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کمیسیون یافت نشذ.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.commissionsService.findOne(+id);
  }

  @Patch()
  @UserAuth()
  @Access([101])
  @ApiOperation({ 
    summary: 'Update commission',
    description: 'Updates commission name'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Commission updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کمیسیون با موفقیت اپدیت شد.' }
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
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  update(@Body() updateCommissionDto: UpdateCommissionDto) {
    return this.commissionsService.update(updateCommissionDto);
  }

  @Delete(':id')
  @UserAuth()
  @Access([101])
  @ApiOperation({ 
    summary: 'Delete commission',
    description: 'Deletes commission and its related role'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Commission deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کمیسیون با موفقیت حذف شد' }
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
  remove(@Param('id') id: string) {
    return this.commissionsService.remove(+id);
  }
}
