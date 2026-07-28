import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inspection } from '../database/entities/inspection.entity';
import { StudentStatistic } from '../database/entities/student-statistic.entity';
import { TeacherTraining } from '../database/entities/teacher-training.entity';
import { TrainingProgram } from '../database/entities/training-program.entity';
import { User } from '../database/entities/user.entity';

import { InspectionsController } from './inspections.controller';
import { StudentStatsController } from './student-stats.controller';
import { TrainingController } from './training.controller';
import { InspectionsService } from './inspections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
      StudentStatistic,
      TeacherTraining,
      TrainingProgram,
      User,
    ]),
  ],
  controllers: [InspectionsController, StudentStatsController, TrainingController],
  providers: [InspectionsService],
})
export class InspectionsModule {}
