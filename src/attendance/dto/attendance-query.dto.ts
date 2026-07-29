import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AttendanceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsIn(['Present', 'Late', 'Absent'])
  status?: 'Present' | 'Late' | 'Absent';

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  institutionId?: string;
}
