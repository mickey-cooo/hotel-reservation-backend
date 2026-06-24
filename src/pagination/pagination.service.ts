import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationQueryDto } from './dto/pagination.dto';
import { PaginatedResult } from './interface/pagination.interface';

@Injectable()
export class PaginationService {
  constructor() {}

  async paginate<T extends ObjectLiteral>(
    queryInstance: PaginationQueryDto,
    qb: SelectQueryBuilder<T>,
  ): Promise<PaginatedResult<T>> {
    const page = queryInstance.page || 1;
    const limit = queryInstance.limit || 10;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }
}
