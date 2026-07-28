import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class NoticeQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  institutionId?: string;
}
