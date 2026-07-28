import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// This DTO gets page, limit, sortBy, order and search from PaginationQueryDto.
// We only add the two extra filters that belong to complaints.
// ApiPropertyOptional makes Swagger show a box for each filter.
export class QueryComplaintsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['Low', 'Medium', 'High'] })
  @IsOptional()
  @IsString()
  @IsIn(['Low', 'Medium', 'High'])
  severity: string;

  @ApiPropertyOptional({ enum: ['Open', 'Escalated', 'Resolved'] })
  @IsOptional()
  @IsString()
  @IsIn(['Open', 'Escalated', 'Resolved'])
  status: string;
}
