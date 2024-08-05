import { UserController } from './user.controller';
import { EmployeeController } from './employee.controller';

export * from './user.controller';

export const controllers = [UserController, EmployeeController];
