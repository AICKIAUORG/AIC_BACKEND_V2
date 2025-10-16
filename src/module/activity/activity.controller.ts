import { Controller, Get, Post, Body, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto, ActivityFilterDto, WarningDto, ChangeActivityStatusDto } from './dto/activity.dto';
import { ApiConsumes, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SwaggerEnums } from 'src/common/enums/swagger.enum';
import { Access } from 'src/common/decorators/roles.decorator';
import { UserAuth } from 'src/common/decorators/auth.decorator';

@Controller('activities')
@ApiTags('Activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}


  @Get()
  @UserAuth()
  @Access([100])
  @ApiOperation({ 
    summary: 'Search and filter activities',
    description: 'Returns list of activities with filtering capabilities by type, status, user, section and date'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Activities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 5 }
          }
        },
        activities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              activity_type: { type: 'string', example: 'MEETING' },
              description: { type: 'string', example: 'شرکت در جلسه' },
              status: { type: 'string', example: 'approve' },
              points: { type: 'number', example: 10 },
              member_id: { type: 'number', example: 1 },
              member_fullName: { type: 'string', example: 'علی احمدی' },
              section_code: { type: 'number', example: 100 },
              approved_by: { type: 'number', example: 1 },
              approver_fullName: { type: 'string', example: 'مدیر سیستم' },
              approved_at: { type: 'string', example: '1404/07/24 19:44' },
              approval_notes: { type: 'string', example: 'تایید شد' },
              created_at: { type: 'string', example: '1404/07/24 19:44' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No results found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'نتیحه ای یافت نشد.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  search(
    @Query() filterDto: ActivityFilterDto
  ) {
    const paginationDto = {limit : filterDto.limit, page : filterDto.page}
    return this.activityService.findAllActivities(paginationDto, filterDto);
  }

  @Get(':id')
  @UserAuth()
  @Access([100])
  @ApiOperation({ 
    summary: 'Get activity details',
    description: 'Returns complete activity information including user and approver details'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Activity details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        activity_type: { type: 'string', example: 'MEETING' },
        description: { type: 'string', example: 'شرکت در جلسه' },
        status: { type: 'string', example: 'approve' },
        points: { type: 'number', example: 10 },
        member_id: { type: 'number', example: 1 },
        member_fullName: { type: 'string', example: 'علی احمدی' },
        section_code: { type: 'number', example: 100 },
        approved_by: { type: 'number', example: 1 },
        approver_fullName: { type: 'string', example: 'مدیر سیستم' },
        approved_at: { type: 'string', example: '1404/07/24 19:44' },
        approval_notes: { type: 'string', example: 'تایید شد' },
        created_at: { type: 'string', example: '1404/07/24 19:44' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Activity not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'فعالیت یافت نشد' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.findActivityById(id);
  }

  @Get('user/:member_id')
  @UserAuth()
  @ApiOperation({ 
    summary: 'Get user activities',
    description: 'Returns activities of a specific user grouped by status'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User activities retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'approve' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                activity_type: { type: 'string', example: 'MEETING' },
                description: { type: 'string', example: 'شرکت در جلسه' },
                status: { type: 'string', example: 'approve' },
                points: { type: 'number', example: 10 },
                section_code: { type: 'number', example: 100 },
                created_at: { type: 'string', example: '1404/07/24 19:44' }
              }
            }
          }
        }
      }
    }
  })
  getUserActivities(@Param('member_id', ParseIntPipe) member_id: number) {
    return this.activityService.getUserActivities(member_id);
  }

  @Get('top/:limit')
  @UserAuth()
  @ApiOperation({ 
    summary: 'Get top users',
    description: 'Returns list of top users based on total points'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Top users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          member_id: { type: 'number', example: 1 },
          full_name: { type: 'string', example: 'علی احمدی' },
          total_points: { type: 'string', example: '150' }
        }
      }
    }
  })
  getTopUsers(@Param('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.activityService.getTopUsers(parsedLimit);
  }

  @Get('statistics/:member_id')
  @UserAuth()
  @ApiOperation({ 
    summary: 'Get user activity statistics',
    description: 'Returns complete activity statistics for a user including approved, rejected, pending activities and warnings'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Activity statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        pendingActivities: { type: 'number', example: 5 },
        approvedActivities: { type: 'number', example: 20 },
        rejectedActivities: { type: 'number', example: 2 },
        warnings: { type: 'number', example: 1 }
      }
    }
  })
  getActivityStatistics(@Param('member_id', ParseIntPipe) member_id: number) {
    return this.activityService.getActivityStatistics(member_id);
  }

  @Post()
  @UserAuth()
  @Access([100,200,300])
  @ApiOperation({ 
    summary: 'Create new activity',
    description: 'Creates a new activity for user. If user is admin, activity is approved immediately'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Activity created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'امتیاز به کاربر تعلق گرفت.' 
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Maximum points for regular users is 30',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'حداکثر امتیاز ۳۰ میباشد.' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کاربر یافت نشد.' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.createActivity(createActivityDto);
  }

  @Post('warning')
  @UserAuth()
  @Access([100])
  @ApiOperation({ 
    summary: 'Create warning for user',
    description: 'Creates a warning for the specified user'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Warning created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'اخطار به کاربر تعلق گرفت.' }
      }
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  createWarning(@Body() warningDto: WarningDto) {
    return this.activityService.CreateWarning(warningDto);
  }

  @Post(':id/revoke')
  @UserAuth()
  @Access([101])
  @ApiOperation({ 
    summary: 'Revoke activity points',
    description: 'Revokes points from an approved activity'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Points revoked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'امتیاز کاریر بازپس گرفته شد.' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Only approved activities can be revoked',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'فقط فعالیت های تایید شده قابل یازپس گیری هستند.' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  revoke(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.revokeActivity(id);
  }

  @Patch(':id')
  @UserAuth()
  @Access([100])
  @ApiOperation({ 
    summary: 'Change activity status',
    description: 'Changes activity status (approve or reject)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Activity status changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'امتیاز به کاریر تعلق گرفت.' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Activity already has status or reason required for rejection',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'فعالیت قبلا تعیین وضعیت شده است' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeActivityStatus: ChangeActivityStatusDto
  ) {
    return this.activityService.changeActivityStatus(id, changeActivityStatus);
  }
}