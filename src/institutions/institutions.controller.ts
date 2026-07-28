import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('institutions')
@ApiBearerAuth()
@Controller('api/institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Roles('admin')
  @ApiOperation({ summary: 'Create a new institution (Admin only)' })
  @Post()
  create(@Body() createInstitutionDto: CreateInstitutionDto) {
    return this.institutionsService.create(createInstitutionDto);
  }

  @ApiOperation({ summary: 'Get all institutions with pagination and search' })
  @Get()
  findAll(@Request() req: any, @Query() query: PaginationQueryDto) {
    return this.institutionsService.findAll(query, req.user);
  }

  @ApiOperation({ summary: 'Get a specific institution by ID' })
  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.institutionsService.findOne(id, req.user);
  }

  @Roles('admin', 'to', 'ato')
  @ApiOperation({ summary: 'Update an institution (Admin, TO, ATO)' })
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateInstitutionDto: UpdateInstitutionDto) {
    return this.institutionsService.update(id, updateInstitutionDto);
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Delete an institution (Admin only)' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.institutionsService.remove(id);
  }
}
