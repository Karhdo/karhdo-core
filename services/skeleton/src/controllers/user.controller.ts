import { Get, Controller } from '@karhdo/nestjs-core';

import { User } from '../models';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public async find(): Promise<User[]> {
    return this.userService.find({});
  }
}
