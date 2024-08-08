import { Get, Controller, Inject, UseInterceptors } from '@karhdo/nestjs-core';

import { CacheInterceptor, Cache, CACHE_MANAGER } from '@karhdo/cache-manager';

import { EmployeeService } from '../services';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Inject(CACHE_MANAGER) private cacheManager: Cache;

  // @UseInterceptors(CacheInterceptor)
  @Get()
  find() {
    return this.employeeService.find();
  }

  @Get('seniors')
  async findSenior() {
    const cachedSeniors = await this.cacheManager.get('all-seniors');

    if (cachedSeniors) {
      return cachedSeniors;
    }

    const seniors = await this.employeeService.findSenior();

    this.cacheManager.set('all-seniors', seniors, 10000);

    return seniors;
  }
}
