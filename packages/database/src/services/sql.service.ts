import { Model } from 'sequelize-typescript';
import { MakeNullishOptional } from 'sequelize/types/utils';
import { WhereOptions, NonNullFindOptions, BulkCreateOptions, UpsertOptions } from 'sequelize';

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

  public async findById(id: number | string, options?: NonNullFindOptions): Promise<T> {
    return this.repository.findById(id, options);
  }

  public async findByIds(ids: Array<number | string>): Promise<T[]> {
    return this.repository.findByIds(ids);
  }

  public async updateById(id: number | string, data: Partial<T>): Promise<T> {
    return this.repository.updateById(id, data);
  }

  public async update(filter: WhereOptions<T>, data: Partial<T>): Promise<T[]> {
    return this.repository.update(filter, data);
  }

  public async updateOne(filter: WhereOptions<T>, data: Partial<T>): Promise<T> {
    return this.repository.updateOne(filter, data);
  }

  public async deleteById(id: string | number): Promise<T> {
    return this.repository.deleteById(id);
  }

  public async delete(options: WhereOptions<T>): Promise<void> {
    await this.repository.delete(options);
  }

  public async deleteOne(filter: WhereOptions<T>): Promise<T> {
    return this.repository.deleteOne(filter);
  }

  public async create(data: MakeNullishOptional<T['_creationAttributes']>): Promise<T> {
    return this.repository.create(data);
  }

  public async createMany(
    data: MakeNullishOptional<T['_creationAttributes']>[],
    options?: BulkCreateOptions<T>,
  ): Promise<T[]> {
    return this.repository.createMany(data, options);
  }

  public async upsert(
    data: MakeNullishOptional<T['_creationAttributes']>[],
    upsertOptions?: UpsertOptions,
  ): Promise<[T[], boolean[] | null]> {
    return this.repository.upsert(data, upsertOptions);
  }
}
