import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentStatDto {
  @ApiProperty({ example: 'ca0f3685-5f1b-406b-97d0-456673a4762c' })
  @IsString()
  institutionId: string;

  @ApiProperty({ example: '2026' })
  @IsString()
  academicYear: string;

  @ApiProperty({ example: 120, minimum: 0 })
  @IsInt()
  @Min(0)
  totalBoys: number;

  @ApiProperty({ example: 110, minimum: 0 })
  @IsInt()
  @Min(0)
  totalGirls: number;
}
