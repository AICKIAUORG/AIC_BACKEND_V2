import { Controller, Get, Post, Body, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto, ActivityFilterDto, WarningDto, ChangeActivityStatusDto } from './dto/activity.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
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
  search(
    @Query() filterDto: ActivityFilterDto
  ) {
    const paginationDto = {limit : filterDto.limit, page : filterDto.page}
    return this.activityService.findAllActivities(paginationDto, filterDto);
  }

  @Get(':id')
  @UserAuth()
  @Access([100])
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.findActivityById(id);
  }

  @Get('user/:member_id')
  @UserAuth()
  getUserActivities(@Param('member_id', ParseIntPipe) member_id: number) {
    return this.activityService.getUserActivities(member_id);
  }

  @Get('top/:limit')
  @UserAuth()
  getTopUsers(@Param('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.activityService.getTopUsers(parsedLimit);
  }

  @Get('statistics/:member_id')
  @UserAuth()
  getActivityStatistics(@Param('member_id', ParseIntPipe) member_id: number) {
    return this.activityService.getActivityStatistics(member_id);
  }

  @Post()
  @UserAuth()
  @Access([100,200,300])
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.createActivity(createActivityDto);
  }

  @Post('warning')
  @UserAuth()
  @Access([100])
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  createWarning(@Body() warningDto: WarningDto) {
    return this.activityService.CreateWarning(warningDto);
  }

  @Post(':id/revoke')
  @UserAuth()
  @Access([101])
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  revoke(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.revokeActivity(id);
  }

  @Patch(':id')
  @UserAuth()
  @Access([100])
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeActivityStatus: ChangeActivityStatusDto
  ) {
    return this.activityService.changeActivityStatus(id, changeActivityStatus);
  }
}