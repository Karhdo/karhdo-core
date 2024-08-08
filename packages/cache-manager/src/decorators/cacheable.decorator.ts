import { Cache } from 'cache-manager';

export function Cacheable(key: string, ttl: number): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheManager: Cache = this.cacheManager;

      const cacheKey = `${propertyKey.toString()}-${key}-${JSON.stringify(args)}`;

      const cachedResult = await cacheManager.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const result = await originalMethod.apply(this, args);
      await cacheManager.set(cacheKey, result, ttl);

      return result;
    };
  };
}
