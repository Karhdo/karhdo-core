import { ModelCtor } from 'sequelize-typescript';

export interface SequelizeModuleOption {
  name: string;
  models: ModelCtor[];

  retryAttempts?: number;
  retryDelay?: number;
}
