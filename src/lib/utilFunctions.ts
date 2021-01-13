import chalk from 'chalk';
import { LogType } from '../enums/logType';

export function printErrorToConsole(error: Error) {
  return console.error(chalk.red(error.message), '\n', error);
}

export function getUTCString(): string {
  return new Date().toUTCString();
}

interface PrintConsoleOpts {
  logType: LogType;
  message?: string;
  error?: Error;
  dataObject?: any;
  json: boolean;
}

export function printToConsole(options: PrintConsoleOpts): any {
  const timestamp = getUTCString();
  const type: LogType = options.logType;
  const json = options.json;
  const message = options.message;

  let logObject = {
    type,
    timestamp,
    message,
  };
  switch (type) {
    case LogType.DEBUG:
      if (json) {
        console.log(chalk.yellow(JSON.stringify(logObject, null, 2)));
      } else {
        console.log(chalk.yellow(`${timestamp} ${LogType.DEBUG}: ${message}`));
      }
      return logObject;
    case LogType.INFO:
      if (json) {
        console.log(chalk.green(JSON.stringify(logObject, null, 2)));
      } else {
        console.log(chalk.green(`${timestamp} ${LogType.INFO}: ${message}`));
      }
      return logObject;
    case LogType.LOG:
      if (json) {
        console.log(chalk.white(JSON.stringify(logObject, null, 2)));
      } else {
        console.log(chalk.white(`${timestamp} ${LogType.LOG}: ${message}`));
      }
      return logObject;
    case LogType.WARN:
      if (json) {
        console.log(chalk.blue(JSON.stringify(logObject, null, 2)));
      } else {
        console.log(chalk.blue(`${timestamp} ${LogType.WARN}: ${message}`));
      }
      return logObject;
    case LogType.ERROR:
      const key = Date.now();
      const errorStack = options.error?.stack || null;
      const errorObject = { errorKey: key, ...logObject, errorStack: errorStack };
      if (json) {
        console.error(chalk.red(JSON.stringify(errorObject, null, 2)));
      } else {
        console.log(chalk.red(`${timestamp} ${LogType.ERROR}: ${errorObject.message}\nError Stack: ${errorStack}`));
      }
      return errorObject;
    case LogType.REQUEST:
      console.log(chalk.green(JSON.stringify(options.dataObject, null, 2)));
      return options.dataObject;
    default:
      return 0;
  }
}
