import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInspectionDto {
  @ApiProperty({ example: 'ca0f3685-5f1b-406b-97d0-456673a4762c' })
  @IsString()
  institutionId: string;

  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @ApiPropertyOptional({ example: 'ভালো অবস্থা' })
  @IsOptional()
  @IsString()
  notes?: string;
}
