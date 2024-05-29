import { SetMetadata } from '@karhdo/nestjs-core';
import { MessageConsumerConfig } from '@karhdo/nestjs-config';

import { RABBIT_HANDLER } from './rabbitmq.constant';

export const Consume = (config: MessageConsumerConfig | string) => {
  return SetMetadata(RABBIT_HANDLER, config);
};
