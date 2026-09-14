import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainingProgramDto {
  @ApiProperty({ example: 'Digital Classroom Techniques' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '3 days' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ example: 'Directorate of Primary Education' })
  @IsString()
  @IsNotEmpty()
  organizer: string;
}
