import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto, UpdateCommissionDto } from './dto/commission.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerEnums } from 'src/common/enums/swagger.enum';

@Controller('commissions')
@ApiTags('Commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post()
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  create(@Body() createCommissionDto: CreateCommissionDto) {
    return this.commissionsService.create(createCommissionDto);
  }

  @Get()
  findAll() {
    return this.commissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commissionsService.findOne(+id);
  }

  @Patch()
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  update(@Body() updateCommissionDto: UpdateCommissionDto) {
    return this.commissionsService.update(updateCommissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commissionsService.remove(+id);
  }
}
