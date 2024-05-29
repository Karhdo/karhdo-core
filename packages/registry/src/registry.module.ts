import { Module, Global, MetadataScanner, DiscoveryModule } from '@karhdo/nestjs-core';
import { RegistryService } from './registry.service';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [RegistryService, MetadataScanner],
  exports: [RegistryService],
})
export class RegistryModule {}
