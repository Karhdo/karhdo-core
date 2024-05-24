import { Model, WhereOptions, NonNullFindOptions, BulkCreateOptions } from 'sequelize';
import { MakeNullishOptional } from 'sequelize/types/utils';

import { SQLRepository } from '../repositories';
import { FindOptions } from '../database.type';

export class SQLService<T extends Model> {
  constructor(private repository: SQLRepository<T>) {}

  public async find(filterOptions: FindOptions<T>): Promise<T[]> {
    return this.repository.find(filterOptions);
  }

  public async findOne(options: { where: WhereOptions<T>; selects?: string[] }): Promise<T> {
    return this.repository.findOne(options);
  }

  public async findById(id: string | number, options?: NonNullFindOptions): Promise<T> {
    return this.repository.findById(id, options);
  }

  public async findByIds(ids: Array<string | number>): Promise<T[]> {
    return this.repository.findByIds(ids);
  }

  // public async updateById(id: string | number, data: Partial<T>): Promise<T> {
  //   return this.repository.updateById(id, data);
  // }

  public async update(filter: WhereOptions<T>, data: Partial<T>): Promise<T[]> {
    return this.repository.update(filter, data);
  }

  public async updateOne(filter: WhereOptions<T>, data: Partial<T>): Promise<T> {
    return this.repository.updateOne(filter, data);
  }

  // public async deleteById(id: string | number): Promise<T> {
  //   return this.repository.deleteById(id);
  // }

  public async delete(options: WhereOptions<T>): Promise<void> {
    await this.repository.delete(options);
  }

  public async deleteOne(options: FindOptions<T>): Promise<T> {
    return this.repository.deleteOne(options);
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

  public async count(filter: WhereOptions<T>): Promise<number> {
    return this.repository.count(filter);
  }
}
