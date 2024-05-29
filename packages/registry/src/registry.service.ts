import { Injectable, DiscoveryService, MetadataScanner } from '@karhdo/nestjs-core';
import { MetadataKey, RegistryClass, RegistryMethodByMetadataKey } from './registry.interface';

@Injectable()
export class RegistryService {
  constructor(
    private discoveryService: DiscoveryService,
    private metadataScanner: MetadataScanner,
  ) {}

  public extractMethodOfClassByMetadataKey<T>(
    component: RegistryClass,
    metadataKey: MetadataKey,
  ): RegistryMethodByMetadataKey<T>[] {
    const { instance } = component;

    if (instance) {
      const prototype = Object.getPrototypeOf(instance);

      const methods = this.metadataScanner.getAllMethodNames(prototype);

      return methods.reduce((extractedMethods, method) => {
        const handler = prototype[method];

        const meta = Reflect.getMetadata(metadataKey, handler);

        if (meta) {
          extractedMethods.push({
            meta,
            registryMethod: {
              handler,
              methodName: method,
              parentClass: component,
            },
          });
        }

        return extractedMethods;
      }, []);
    }

    return [];
  }
}
