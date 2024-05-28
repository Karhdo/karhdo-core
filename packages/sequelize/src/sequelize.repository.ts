import { Model } from 'sequelize-typescript';
import { MakeNullishOptional } from 'sequelize/types/utils';
import { FindOptions, WhereOptions, NonNullFindOptions, BulkCreateOptions } from 'sequelize';

import { Table } from './sequelize.type';

export class SequelizeRepository<T extends Model> {
  constructor(protected table: Table<T>) {}

  public async find(options: FindOptions<T>): Promise<T[]> {
    return this.table.findAll<T>(options);
  }

  public async findOne(options: { filter: WhereOptions<T>; attributes?: string[] }): Promise<T> {
    const { filter, attributes } = options;

    return this.table.findOne<T>({ where: filter, attributes });
  }

  public async findById(id: number | any, options?: NonNullFindOptions): Promise<T> {
    return this.table.findByPk<T>(id, options);
  }

  public async findByIds(ids: Array<number | any>): Promise<T[]> {
    return this.table.findAll<T>({
      where: {
        id: {
          $in: ids,
        },
      },
    });
  }

  public async update(where: WhereOptions<T>, data: Partial<T>): Promise<T[]> {
    await this.table.update<T>(data, { where });

    return this.find({ where });
  }

  public async updateOne(filter: WhereOptions<T>, data: Partial<T>): Promise<T> {
    await this.table.update<T>(data, { where: filter });

    return this.findOne({ filter });
  }

  public async updateById(id: number | any, data: Partial<T>): Promise<T> {
    return this.updateOne({ id }, data);
  }

  public async delete(where: WhereOptions<T>): Promise<number> {
    return this.table.destroy<T>({ where });
  }

  public async deleteOne(filter: WhereOptions<T>, options?: FindOptions<T>): Promise<T> {
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

  public async insert(data: MakeNullishOptional<T['_creationAttributes']>): Promise<T> {
    return this.table.create(data);
  }

  public async insertMany(
    data: MakeNullishOptional<T['_creationAttributes']>[],
    options?: BulkCreateOptions,
  ): Promise<T[]> {
    return this.table.bulkCreate<T>(data, options);
  }
}
