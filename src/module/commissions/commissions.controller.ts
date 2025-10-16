import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto, UpdateCommissionDto } from './dto/commission.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
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
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  create(@Body() createCommissionDto: CreateCommissionDto) {
    return this.commissionsService.create(createCommissionDto);
  }

  @Get()
  @UserAuth()
  findAll() {
    return this.commissionsService.findAll();
  }

  @Get(':id')
  @UserAuth()
  findOne(@Param('id') id: string) {
    return this.commissionsService.findOne(+id);
  }

  @Patch()
  @UserAuth()
  @Access([101])
  @ApiConsumes(SwaggerEnums.UrlEncoded)
  update(@Body() updateCommissionDto: UpdateCommissionDto) {
    return this.commissionsService.update(updateCommissionDto);
  }

  @Delete(':id')
  @UserAuth()
  @Access([101])
  remove(@Param('id') id: string) {
    return this.commissionsService.remove(+id);
  }
}
