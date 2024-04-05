/* eslint-disable no-console */
import { parse } from 'path';
import { Injectable } from '@karhdo/nestjs-core';
import { isString, isObject, isError, isUndefined, isArray, map, find, reduce, get, filter } from 'lodash';

import { ColorizeLog, LogLevel } from './logger.enum';
import { LogMessage, LogArgument } from './logger.interface';

@Injectable()
export class LoggerService {
  constructor() {}

  private log(level: LogLevel, ...args: Array<LogArgument>) {
    const logMessage: LogMessage = {
      level,
      time: new Date().toISOString(),
      message: this.getLogMessage(...args),
      caller: this.getCaller(...args),
      error: this.getLogError(...args),
      data: this.getLogData(...args),
    };

    const templateLogger = this.getTransformableTemplateFormat(logMessage);

    console.log(templateLogger);
  }

  public info(...args: Array<LogArgument>) {
    return this.log(LogLevel.INFO, ...args);
  }

  public debug(...args: Array<LogArgument>) {
    return this.log(LogLevel.DEBUG, ...args);
  }

  public warning(...args: Array<LogArgument>) {
    return this.log(LogLevel.WARNING, ...args);
  }

  public error(...args: Array<LogArgument>) {
    return this.log(LogLevel.ERROR, ...args);
  }

  private getCurrentFilename(): string {
    return parse(__filename).name;
  }

  private sanitize(data: object | Array<object>): object {
    if (isArray(data)) {
      const clones = data as Array<object[]>;

      return clones.map((clone) => this.sanitize(clone));
    } else if (isObject(data)) {
      const clone = { ...data };

      for (const key in clone) {
        const value = clone[key];

        if (isUndefined(value)) {
          delete clone[key];
        }

        if (isObject(value) || isArray(value)) {
          clone[key] = this.sanitize(value);
        }
      }

      return clone;
    }

    return data;
  }

  private getLogMessage(...args: Array<LogArgument>): string {
    const stringArgs = filter(args, isString);
    const objectArgs = filter(args, isObject);

    const message = stringArgs.length ? stringArgs : map(objectArgs, 'message');

    return message.join(' ');
  }

  private getLogError(...args: Array<LogArgument>): Error {
    return find(args, isError) as Error;
  }

  private getCaller(...args: Array<LogArgument>) {
    const error = this.getLogError(...args) || new Error('-');
    const matches = error.stack.matchAll(/at .*[/\\](.+?\.(?:js|ts):\d+):/g);

    const currentFilename = this.getCurrentFilename();

    for (const match of matches) {
      const filename = match[1];

      if (!filename.includes(currentFilename)) {
        return filename;
      }
    }

    return '';
  }

  private getLogData(...args: Array<LogArgument>): Record<string, any> {
    const data = reduce(
      args,
      (prev, arg) => {
        if (isObject(arg)) {
          Object.assign(prev, arg);
        }

        return prev;
      },
      {},
    );

    return Object.keys(data).length > 0 ? this.sanitize(data) : undefined;
  }

  private getColorizeLog(level: LogLevel) {
    switch (level) {
      case LogLevel.INFO:
        return ColorizeLog.FG_GREEN;
      case LogLevel.DEBUG:
        return ColorizeLog.FG_MAGENTA;
      case LogLevel.WARNING:
        return ColorizeLog.FG_YELLOW;
      case LogLevel.ERROR:
        return ColorizeLog.FG_RED;
      default:
        return ColorizeLog.FG_WHITE;
    }
  }

  private getTransformableTemplateFormat(logMessage: LogMessage) {
    const { level, time, message, caller, data, error } = logMessage;

    const baseFormat = {
      level,
      message,
      location: caller,
      time,
      ...(data && { data: JSON.stringify(data) }),
      ...(error && error.message && { error: error.message }),
      ...(error && error.stack && { stack: JSON.stringify(error.stack) }),
    };

    const colorizeLog = this.getColorizeLog(level);

    const formats = Object.keys(baseFormat).map((transformableField) => {
      const transformableValue = get(baseFormat, transformableField);

      return `${transformableField}: ${colorizeLog}${transformableValue}${ColorizeLog.RESET}`;
    });

    return formats.join(', ');
  }
}
