import chalk from 'chalk';
import ReqLogObject from '../interfaces/reqLogObject';
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
  dataObject?: ReqLogObject;
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
        return logObject;
      } else {
        const debugString = `${timestamp} ${LogType.DEBUG}: ${message}`;
        console.log(chalk.yellow(debugString));
        return debugString;
      }
    case LogType.INFO:
      if (json) {
        console.log(chalk.green(JSON.stringify(logObject, null, 2)));
        return logObject;
      } else {
        const infoString = `${timestamp} ${LogType.INFO}: ${message}`;
        console.log(chalk.green(infoString));
        return infoString;
      }
    case LogType.LOG:
      if (json) {
        console.log(chalk.white(JSON.stringify(logObject, null, 2)));
        return logObject;
      } else {
        const logString = `${timestamp} ${LogType.LOG}: ${message}`;
        console.log(chalk.white(logString));
        return logString;
      }
    case LogType.WARN:
      if (json) {
        console.log(chalk.blue(JSON.stringify(logObject, null, 2)));
        return logObject;
      } else {
        const warnString = `${timestamp} ${LogType.WARN}: ${message}`;
        console.log(chalk.blue(warnString));
        return warnString;
      }
    case LogType.ERROR:
      const key = Date.now();
      const errorStack = options.error?.stack || null;
      const errorObject = { errorKey: key, ...logObject, errorStack: errorStack };
      if (json) {
        console.error(chalk.red(JSON.stringify(errorObject, null, 2)));
        return { data: errorObject, key };
      } else {
        const errorString = `${timestamp} ${LogType.ERROR}: Error Key - ${key} ${errorObject.message}\nError Stack: ${errorStack}`;
        console.log(chalk.red(errorString));
        return { data: errorString, key };
      }
    case LogType.REQUEST:
      const reqLog = options.dataObject;
      if (json) {
        console.log(chalk.green(JSON.stringify(options.dataObject, null, 2)));
        return reqLog;
      } else {
        const reqLogString = `${timestamp}, ${LogType.REQUEST}: method - ${reqLog?.method}, url - ${
          reqLog?.url
        }, clientIp - ${reqLog?.clientIp}, ipFamily - ${reqLog?.ipFamily}, userAgent - ${
          reqLog?.userAgent
        }, httpVersion - ${reqLog?.httpVersion}, params - ${JSON.stringify(reqLog?.params)}, headers - ${JSON.stringify(
          reqLog?.headers,
        )}, body - ${JSON.stringify(reqLog?.body)}`;
        console.log(chalk.green(reqLogString));
        return reqLogString;
      }
    default:
      return 0;
  }
}
