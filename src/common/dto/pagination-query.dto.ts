import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 10;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsOptional() @IsString() sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional() @IsIn(['ASC', 'DESC']) order: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional() @IsString() search?: string;
}
