import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination.dto';
import { PaginatedResult } from './interface/pagination.interface';

@Injectable()
export class PaginationService {
  constructor() {}

  async paginate<T>(
    queryInstance: PaginationQueryDto,
    dbExecutor: (skip: number, take: number) => Promise<[T[], number]>,
  ): Promise<PaginatedResult<T>> {
    const page = queryInstance.page || 1;
    const limit = queryInstance.limit || 10;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await dbExecutor(skip, limit);
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
