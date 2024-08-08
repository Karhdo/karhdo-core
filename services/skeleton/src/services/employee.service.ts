import { Inject, Injectable } from '@karhdo/nestjs-core';
import { CACHE_MANAGER, Cacheable, Cache } from '@karhdo/cache-manager';

import { getEmployees, getSeniorEmployees } from '../utils';

@Injectable()
export class EmployeeService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Cacheable('all-employees', 10000)
  async find() {
    const results = await getEmployees();

    return results;
  }

  async findSenior() {
    return await getSeniorEmployees();
  }
}
