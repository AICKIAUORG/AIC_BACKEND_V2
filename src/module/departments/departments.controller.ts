import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerEnums } from 'src/common/enums/swagger.enum';
import { UserAuth } from 'src/common/decorators/auth.decorator';
import { Access } from 'src/common/decorators/roles.decorator';

@Controller('departments')
@ApiTags('Departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(+id);
  }

  @Patch()
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  update(@Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(updateDepartmentDto);
  }

  @UserAuth()
  @Access([100,200,300])
  @Patch('/addMember')
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  addMember(@Query('member_id') member_id: string, @Query('department_id') department_id: string) {
    return this.departmentsService.addMember(+member_id, +department_id);
  }

  @UserAuth()
  @Access([100])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(+id);
  }
}
