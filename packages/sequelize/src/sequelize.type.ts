import { Model } from 'sequelize-typescript';

export type Constructor<T = any> = new (...args: any[]) => T;

export type Table<T> = Constructor<T> & typeof Model;
