import forOwn from 'lodash/forOwn';
import isPlainObject from 'lodash/isPlainObject';

import { ObjectLiteral } from '../types';

export const forEachDeep = (object: ObjectLiteral, callback: (value: any) => void) => {
  const iteratee = (obj: any) => {
    forOwn(obj, (value) => {
      callback(value);

      if (isPlainObject(value)) {
        iteratee(value);
      }
    });
  };

  iteratee(object);
};
