import { LogLevel } from './logger.enum';

export type LogArgument = string | Error | object;

export interface LogMessage {
  error: Error;
  time: string;
  caller: string;
  message: string;
  level: LogLevel;
  data: Record<string, any>;
}
