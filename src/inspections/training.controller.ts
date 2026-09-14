import { Controller, Post, Get, Body } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { AssignTrainingDto } from './dto/assign-training.dto';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/training')
export class TrainingController {
  constructor(private inspectionsService: InspectionsService) {}

  @Roles('admin', 'officer')
  @Post('programs')
  createProgram(@Body() dto: CreateTrainingProgramDto) {
    return this.inspectionsService.createTrainingProgram(dto);
  }

  @Get('programs')
  findAllPrograms() {
    return this.inspectionsService.findAllTrainingPrograms();
  }

  @Roles('admin', 'officer')
  @Get('teachers')
  findTeachers() {
    return this.inspectionsService.findTeachers();
  }

  @Get('records')
  findRecords() {
    return this.inspectionsService.findTeacherTrainings();
  }

  @Roles('admin', 'officer')
  @Post('assign')
  assign(@Body() dto: AssignTrainingDto) {
    return this.inspectionsService.assignTraining(dto);
  }
}
