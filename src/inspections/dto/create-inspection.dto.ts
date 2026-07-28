import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateInspectionDto {
  @IsString()
  institutionId: string;

  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
