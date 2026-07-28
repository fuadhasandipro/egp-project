import {
  IsDateString,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLeaveRequestDto {
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate: string;
}
