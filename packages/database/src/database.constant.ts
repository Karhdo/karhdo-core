import { Op } from 'sequelize';

export const DATABASE_MODULE_OPTION = 'DATABASE_MODULE_OPTION';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const DATABASE_REPOSITORY = 'DATABASE_REPOSITORY';

export const RETRY_DELAY = 2000;

export const RETRY_ATTEMPT = 10;

export const OPERATORS_ALIASES = {
  $eq: Op.eq,
  $ne: Op.ne,
  $in: Op.in,
  $lt: Op.lt,
  $lte: Op.lte,
  $gt: Op.gt,
  $gte: Op.gte,
  $or: Op.or,
  $and: Op.and,
};
