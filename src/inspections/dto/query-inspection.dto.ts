import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryInspectionDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  institutionId?: string;

  @IsOptional()
  @IsString()
  inspectorId?: string;
}
