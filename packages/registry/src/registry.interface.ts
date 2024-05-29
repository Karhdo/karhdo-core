export interface RegistryClass<T = object> {
  name: string;
  instance: T;
}

export interface RegistryMethod {
  handler: (...args: any[]) => any;
  methodName: string;
  parentClass: RegistryClass;
}

export interface RegistryMethodByMetadataKey<T> {
  meta: T;
  registryMethod: RegistryMethod;
}

export type MetadataKey = string | number | symbol;

export type InstanceWrapper = {
  metatype: unknown;
  name: string;
  instance: unknown;
};
