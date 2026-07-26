import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  { page, limit, sortBy, order }: PaginationQueryDto,
  alias: string,
) {
  if (sortBy) qb.orderBy(`${alias}.${sortBy}`, order);
  const [items, total] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return { items, meta: { total, page, limit, pageCount: Math.ceil(total / limit) } };
}
