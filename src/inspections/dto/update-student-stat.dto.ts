import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateStudentStatDto {
  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalBoys?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalGirls?: number;
}
