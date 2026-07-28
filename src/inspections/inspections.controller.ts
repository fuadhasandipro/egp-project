import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { QueryInspectionDto } from './dto/query-inspection.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/inspections')
export class InspectionsController {
  constructor(private inspectionsService: InspectionsService) {}

  @Roles('officer')
  @Post()
  create(@Body() dto: CreateInspectionDto, @Request() req: any) {
    return this.inspectionsService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Query() query: QueryInspectionDto, @Request() req: any) {
    return this.inspectionsService.findAll(query, req.user);
  }
}
