import { DATABASE_CONNECTION, DATABASE_MODULE_OPTION } from './database.constant';

export const getDatabaseModuleOptionToken = (connection: string = DATABASE_CONNECTION): string => {
  return `${connection}_${DATABASE_MODULE_OPTION}`;
};

export const getConnectionToken = (connection: string = DATABASE_CONNECTION): string => {
  return `${connection}Connection`;
};
