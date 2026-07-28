import { IsString, IsDateString } from 'class-validator';

export class AssignTrainingDto {
  @IsString()
  userId: string;

  @IsString()
  trainingId: string;

  @IsDateString()
  completionDate: string;
}
