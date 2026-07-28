import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryComplaintsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['Low', 'Medium', 'High'] })
  @IsOptional()
  @IsString()
  @IsIn(['Low', 'Medium', 'High'])
  severity?: string;

  @ApiPropertyOptional({ enum: ['Open', 'Escalated', 'Resolved'] })
  @IsOptional()
  @IsString()
  @IsIn(['Open', 'Escalated', 'Resolved'])
  status?: string;
}
