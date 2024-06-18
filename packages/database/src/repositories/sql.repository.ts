import { Model } from 'sequelize-typescript';
import { MakeNullishOptional } from 'sequelize/types/utils';
import { NonNullFindOptions, BulkCreateOptions } from 'sequelize';

import { IRepository } from '../database.interface';
import { Table, FindOptions, Filter } from '../database.type';

export class SQLRepository<T extends Model> implements IRepository<T> {
  constructor(protected table: Table<T>) {}

  public async find(options: FindOptions<T>): Promise<T[]> {
    const { selects, skip, ...rest } = options;

    return this.table.findAll<T>({
      offset: skip,
      attributes: selects,
      ...rest,
    });
  }

  public async findOne(options: { where: Filter<T>; selects?: string[] }): Promise<T> {
    const { where, selects } = options;

    return this.table.findOne<T>({
      where,
      attributes: selects,
    });
  }

  public async findById(id: string | number, options?: NonNullFindOptions): Promise<T> {
    return this.table.findByPk<T>(id, options);
  }

  public async findByIds(ids: Array<string | number>): Promise<T[]> {
    return this.table.findAll<T>({
      where: {
        id: {
          $in: ids,
        },
      },
    });
  }

  public async update(where: Filter<T>, data: Partial<T>): Promise<T[]> {
    await this.table.update<T>(data, { where });

    return this.find({ where });
  }

  public async updateOne(where: Filter<T>, data: Partial<T>): Promise<T> {
    await this.table.update<T>(data, { where });

    return this.findOne({ where });
  }

  public async updateById(id: number | any, data: Partial<T>): Promise<T> {
    return this.updateOne({ id }, data);
  }

  public async delete(where: Filter<T>): Promise<number> {
    return this.table.destroy<T>({ where });
  }

  public async deleteOne(filter: Filter<T>, options?: FindOptions<T>): Promise<T> {
    const row = await this.table.findOne<T>({
      where: filter,
      ...options,
    });

    if (row) {
      await row.destroy();
    }

    return row;
  }

  public async deleteById(id: number | any): Promise<T> {
    return this.deleteOne({ id });
  }

  public async create(data: MakeNullishOptional<T['_creationAttributes']>): Promise<T> {
    return this.table.create(data);
  }

  public async createMany(
    data: MakeNullishOptional<T['_creationAttributes']>[],
    options?: BulkCreateOptions,
  ): Promise<T[]> {
    return this.table.bulkCreate<T>(data, options);
  }

  public async upsert(data: MakeNullishOptional<T['_creationAttributes']>[]): Promise<[T[], number[]]> {
    const instances = [];
    const wasCreated = [];

    for (const item of data) {
      const [instance, created] = await this.table.upsert<T>(item, { returning: true });
      instances.push(instance);
      wasCreated.push(created);
    }

    return [instances, wasCreated];
  }
}
