import { ValidationError } from 'class-validator';

import get from 'lodash/get';
import map from 'lodash/map';

interface ConfigErrorMessage {
  field: string;
  errorMessage: string;
  value: any;
}

interface DisplayConfigErrorOptions {
  stopAtFirstError: boolean;
}

type ValidationErrorFormatted = Partial<ValidationError>;

export const formatValidationError = (errors: Array<ValidationError>): Array<ValidationErrorFormatted> => {
  const formatTemplates: Array<Partial<ValidationError>> = [];

  const extractValidationError = (error: ValidationError, prefix?: string) => {
    const { property, value, constraints, children } = error;

    const keyPath = prefix ? `${prefix}.${property}` : property;

    if (children && children.length) {
      children.forEach((child) => extractValidationError(child, keyPath));
    }

    if (constraints) {
      formatTemplates.push({
        value,
        constraints,
        property: keyPath,
      });
    }
  };

  errors.forEach((error) => extractValidationError(error));

  return formatTemplates;
};

export const getConfigErrorMessage = (errors: Array<ValidationError>): Array<ConfigErrorMessage> => {
  const formatTemplates = formatValidationError(errors);

  const results = map(formatTemplates, (formatTemplate: ValidationErrorFormatted) => {
    const { property, constraints, value } = formatTemplate;

    return {
      value,
      field: property,
      errorMessage: Object.values(constraints).join(', '),
    };
  });

  return results;
};

export const displayConfigErrorMessage = (
  configErrors: Array<ConfigErrorMessage>,
  options: DisplayConfigErrorOptions,
): string => {
  const formats = [];

  for (const configError of configErrors) {
    const format = Object.keys(configError)
      .map((transformableField) => {
        const transformableValue = get(configError, transformableField);

        return `${transformableField}: ${JSON.stringify(transformableValue)}`;
      })
      .join(', ');

    formats.push(format);

    if (options.stopAtFirstError) {
      break;
    }
  }

  return `[Invalid Configure Application] ${formats.join('\n')}`;
};
