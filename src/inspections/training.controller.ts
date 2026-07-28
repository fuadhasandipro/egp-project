import { Controller, Post, Body } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { AssignTrainingDto } from './dto/assign-training.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/training')
export class TrainingController {
  constructor(private inspectionsService: InspectionsService) {}

  @Roles('admin', 'officer')
  @Post('assign')
  assign(@Body() dto: AssignTrainingDto) {
    return this.inspectionsService.assignTraining(dto);
  }
}
