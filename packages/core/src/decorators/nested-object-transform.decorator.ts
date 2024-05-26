import { Transform, plainToClass, ClassConstructor, TransformFnParams } from 'class-transformer';
import { ObjectLiteral } from '../types';

export const NestedObjectTransform = (
  type: ClassConstructor<object>,
  transformFn: (params: TransformFnParams) => any,
) => {
  return Transform(({ value, ...rest }) => {
    const clazz = Object.keys(value).reduce((prev: ObjectLiteral, key: string) => {
      prev[key] = plainToClass(type, value[key]);

      return prev;
    }, {});

    return transformFn({ value: clazz, ...rest });
  });
};
