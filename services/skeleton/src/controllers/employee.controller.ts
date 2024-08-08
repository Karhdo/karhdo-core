import { Get, Controller, Inject, UseInterceptors } from '@karhdo/nestjs-core';

import { CacheInterceptor, Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

import { getEmployees, getSeniorEmployees } from '../utils';

@Controller('employees')
export class EmployeeController {
  @Inject(CACHE_MANAGER) private cacheManager: Cache;

  @UseInterceptors(CacheInterceptor)
  @Get()
  find() {
    return getEmployees();
  }

  @Get('seniors')
  async findSenior() {
    const cachedSeniors = await this.cacheManager.get('all-seniors');

    if (cachedSeniors) {
      return cachedSeniors;
    }

    const seniors = await getSeniorEmployees();

    this.cacheManager.set('all-seniors', seniors, 10000);

    return seniors;
  }
}
