import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTrainingDto {
  @ApiProperty({ example: 'a8b53b65-e9d9-429a-9ba0-be3af35a581b', description: 'Teacher (User) id' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '09ae4c7e-340b-4f14-9c19-04962702bb51' })
  @IsString()
  trainingId: string;

  @ApiProperty({ example: '2026-07-20' })
  @IsDateString()
  completionDate: string;
}
