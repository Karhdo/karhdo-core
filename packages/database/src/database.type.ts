import { WhereOptions } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';

import { SQLOptions } from './database.interface';

export type Constructor<T = any> = new (...args: any[]) => T;

export type Table<T> = Constructor<T> & typeof Model;
export type Filter<T> = WhereOptions<T>;

export type FilterOptions<T = any> = {
  where?: Filter<T>;
  selects?: string[];
  limit?: number;
  skip?: number;
  page?: number;
};

export type FindOptions<T> = Omit<SQLOptions<T>, 'attributes' | 'offset'>;

export type Entities = ModelCtor;
