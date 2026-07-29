import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentStatDto {
  @ApiPropertyOptional({ example: '2026' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ example: 130, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalBoys?: number;

  @ApiPropertyOptional({ example: 110, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalGirls?: number;
}
