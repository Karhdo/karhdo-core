import { Model, Column, UpdatedAt, CreatedAt, DeletedAt } from 'sequelize-typescript';

export class SQLModel extends Model {
  @Column
  created_by: number;

  @Column
  updated_by: number;

  @UpdatedAt
  updated_at: Date;

  @CreatedAt
  created_at: Date;

  @DeletedAt
  deleted_at: Date;
}
