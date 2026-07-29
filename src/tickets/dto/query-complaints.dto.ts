import { IsString, IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';


export class QueryComplaintsDto extends PaginationQueryDto {

@ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
 page: number = 1;

  
  @ApiPropertyOptional({ type: Number, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

 
  @ApiPropertyOptional({ enum: ['severity', 'status', 'description'] })
  @IsOptional()
  @IsString()
  sortBy?: string = undefined;


  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';


  @ApiPropertyOptional({ example: 'roof' })
  @IsOptional()
  @IsString()
  search?: string = undefined;

  
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
