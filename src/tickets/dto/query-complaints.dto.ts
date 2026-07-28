import { IsString, IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// This DTO extends PaginationQueryDto so it already has
// page, limit, sortBy, order and search.
//
// We write those five fields again here for one reason only:
// Swagger does not draw a box for a field it cannot see, and it
// cannot see fields that come from the parent class.
// The rules and the default values are exactly the same as the parent.
export class QueryComplaintsDto extends PaginationQueryDto {
  // PAGINATION: which page do you want. First page is 1.
@ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
 page: number = 1;

  // PAGINATION: how many rows in one page.
  @ApiPropertyOptional({ type: Number, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  // SORT: which column to sort by.
  @ApiPropertyOptional({ enum: ['severity', 'status', 'description'] })
  @IsOptional()
  @IsString()
  sortBy?: string = undefined;

  // SORT: small to big (ASC) or big to small (DESC).
  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';

  // SEARCH: any word inside the complaint description.
  @ApiPropertyOptional({ example: 'roof' })
  @IsOptional()
  @IsString()
  search?: string = undefined;

  // FILTER: only complaints of this severity.
  @ApiPropertyOptional({ enum: ['Low', 'Medium', 'High'] })
  @IsOptional()
  @IsString()
  @IsIn(['Low', 'Medium', 'High'])
  severity?: string;

  // FILTER: only complaints of this status.
  @ApiPropertyOptional({ enum: ['Open', 'Escalated', 'Resolved'] })
  @IsOptional()
  @IsString()
  @IsIn(['Open', 'Escalated', 'Resolved'])
 status?: string;
}
