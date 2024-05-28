import { FindOptions, FindAttributeOptions } from 'sequelize';

import { Entities, Filter, FilterOptions } from './database.type';

export interface IRepository<T> {
  find(filterOptions: FilterOptions<T>): Promise<T[]>;

  findOne(options: { where: Filter<T>; selects: string[] }): Promise<T>;

  findById(id: string | number): Promise<T>;

  findByIds(ids: Array<string | number>): Promise<T[]>;

  count(filter: Filter<T>): Promise<number>;

  update(filter: Filter<T>, data: Partial<T>): Promise<T[]>;

  updateOne(filter: Filter<T>, data: Partial<T>): Promise<T>;

  updateById(id: number | any, data: Partial<T>): Promise<T>;

  delete(filter: Filter<T>): Promise<number>;

  deleteOne(filter: Filter<T>, options?: FindOptions<T>): Promise<T>;

  deleteById(id: number | any): Promise<T>;

  insert(data: Partial<T>): Promise<T>;

  insertMany(data: Partial<T>[]): Promise<T[]>;
}

export interface SQLOptions<T> extends FindOptions<T> {
  skip?: number;
  selects?: FindAttributeOptions;
}

export interface DatabaseModuleOption {
  name: string;
  entities: Entities[];

  retryAttempts?: number;
  retryDelay?: number;
}
