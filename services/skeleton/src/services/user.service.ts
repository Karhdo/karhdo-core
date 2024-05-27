import { Injectable } from '@karhdo/nestjs-core';
import { SQLService } from '@karhdo/nestjs-database';

import { User } from '../models';
import { UserRepository } from '../repositories';

@Injectable()
export class UserService extends SQLService<User> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }
}
