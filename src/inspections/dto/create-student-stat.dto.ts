import { IsString, IsInt, Min } from 'class-validator';

export class CreateStudentStatDto {
  @IsString()
  institutionId: string;

  @IsString()
  academicYear: string;

  @IsInt()
  @Min(0)
  totalBoys: number;

  @IsInt()
  @Min(0)
  totalGirls: number;
}
