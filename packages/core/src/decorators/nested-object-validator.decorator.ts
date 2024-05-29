/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ValidatorConstraintInterface,
  ValidatorConstraint,
  ValidationArguments,
  ValidatorOptions,
  registerDecorator,
  validateSync,
} from 'class-validator';

import { ClassConstructor, plainToClass } from 'class-transformer';

@ValidatorConstraint()
export class IsNestedObjectConstraint<T extends object> implements ValidatorConstraintInterface {
  constructor(private typeRef: ClassConstructor<T>) {}

  public validate(value: any, args: ValidationArguments) {
    const validatedSchemas = Object.entries(value).reduce((prev, mapper) => {
      const [_, config] = mapper;

      const clazz = plainToClass(this.typeRef, config);

      prev.push(validateSync(clazz));

      return prev;
    }, []);

    return validatedSchemas.every((validatedSchema) => validatedSchema.length === 0);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property}: invalid field format`;
  }
}

export const NestedObjectValidator = (type: any, validatorOptions?: ValidatorOptions) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsNestedObjectConstraint',
      target: object.constructor,
      propertyName,
      options: validatorOptions,
      validator: new IsNestedObjectConstraint(type),
    });
  };
};
