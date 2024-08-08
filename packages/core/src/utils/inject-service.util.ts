import { Inject } from '@nestjs/common';

import { pickEntities } from './pick-entities';

import camelCase from 'lodash/camelCase';

// eslint-disable-next-line @typescript-eslint/ban-types
interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export const InjectService = (target: any, inject: Type | Type[]) => {
  const injects = pickEntities(inject);

  for (const inject of injects) {
    const service = Inject(inject);

    const named = camelCase(inject.name);

    service(target, named);
  }
};
