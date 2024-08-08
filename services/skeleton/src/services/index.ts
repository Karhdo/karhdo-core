import { UserService } from './user.service';
import { EmployeeService } from './employee.service';

export * from './user.service';
export * from './employee.service';

export const services = [UserService, EmployeeService];
