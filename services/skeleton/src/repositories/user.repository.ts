import { SQLRepository } from '@karhdo/nestjs-database';

import { User } from '../models';

export class UserRepository extends SQLRepository<User> {
  constructor() {
    super(User);
  }
}
