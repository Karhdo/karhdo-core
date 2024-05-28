import { Model } from 'sequelize-typescript';
import { MakeNullishOptional } from 'sequelize/types/utils';
import { FindOptions, WhereOptions, NonNullFindOptions, BulkCreateOptions } from 'sequelize';

import { SequelizeRepository } from './sequelize.repository';

export class SQLService<T extends Model> {
  constructor(private repository: SequelizeRepository<T>) {}

  public async find(options: FindOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  public async findOne(options: { filter: WhereOptions<T>; attributes?: string[] }): Promise<T> {
    return this.repository.findOne(options);
  }

  public async findById(id: number | any, options?: NonNullFindOptions): Promise<T> {
    return this.repository.findById(id, options);
  }

  public async findByIds(ids: Array<number | any>): Promise<T[]> {
    return this.repository.findByIds(ids);
  }

  public async updateById(id: number | any, data: Partial<T>): Promise<T> {
    return this.repository.updateById(id, data);
  }

  public async update(filter: WhereOptions<T>, data: Partial<T>): Promise<T[]> {
    return this.repository.update(filter, data);
  }

  public async updateOne(filter: WhereOptions<T>, data: Partial<T>): Promise<T> {
    return this.repository.updateOne(filter, data);
  }

  public async deleteById(id: number | string): Promise<T> {
    return this.repository.deleteById(id);
  }

  public async delete(filter: WhereOptions<T>): Promise<void> {
    await this.repository.delete(filter);
  }

  public async deleteOne(filter: WhereOptions<T>): Promise<T> {
    return this.repository.deleteOne(filter);
  }

  public async insert(data: MakeNullishOptional<T['_creationAttributes']>): Promise<T> {
    return this.repository.insert(data);
  }

  public async insertMany(
    data: MakeNullishOptional<T['_creationAttributes']>[],
    options?: BulkCreateOptions,
  ): Promise<T[]> {
    return this.repository.insertMany(data, options);
  }
}
