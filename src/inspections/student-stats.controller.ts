import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { CreateStudentStatDto } from './dto/create-student-stat.dto';
import { UpdateStudentStatDto } from './dto/update-student-stat.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/student-stats')
export class StudentStatsController {
  constructor(private inspectionsService: InspectionsService) {}

  @Roles('head_teacher')
  @Post()
  create(@Body() dto: CreateStudentStatDto) {
    return this.inspectionsService.createStudentStat(dto);
  }

  @Get()
  findAll() {
    return this.inspectionsService.findAllStudentStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inspectionsService.findOneStudentStat(id);
  }

  @Roles('head_teacher')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentStatDto) {
    return this.inspectionsService.updateStudentStat(id, dto);
  }

  @Roles('head_teacher')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inspectionsService.removeStudentStat(id);
  }
}
