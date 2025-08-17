import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/create-department.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerEnums } from 'src/common/enums/swagger.enum';

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

  @Patch(':id')
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  update(@Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(updateDepartmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(+id);
  }
}
