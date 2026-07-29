import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryInspectionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'ca0f3685-5f1b-406b-97d0-456673a4762c' })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @ApiPropertyOptional({ example: '4bee8189-cbab-4e57-8394-e65dbb55cbfc' })
  @IsOptional()
  @IsString()
  inspectorId?: string;
}
