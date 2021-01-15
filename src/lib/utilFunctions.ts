import chalk from 'chalk';
import { LogObject, ErrorLogObject, ReqLogObject } from '../types/types';
import { LogType } from '../enums/enums';

export function printErrorToConsole(error: Error) {
  return console.error(chalk.red(error.message), '\n', error);
}

export function getUTCString(): string {
  return new Date().toUTCString();
}

export function getLogObject(type: LogType, message: string): LogObject {
  const timestamp = getUTCString();
  const logObject: LogObject = {
    timestamp,
    type,
    message,
  };
  return logObject;
}

export function logObjectToString(logObj: LogObject) {
  const formattedString = `${logObj.timestamp} ${logObj.type}: ${logObj.message}`;
  return formattedString;
}

export function printJsonLog(logObj: LogObject) {
  const stringToPrint = stringifyObject(logObj);
  switch (logObj.type) {
    case LogType.DEBUG:
      console.log(chalk.yellow(stringToPrint));
      return;
    case LogType.INFO:
      console.log(chalk.white(stringToPrint));
      return;
    case LogType.WARN:
      console.log(chalk.blue(stringToPrint));
      return;
    default:
      console.log(chalk.white(stringToPrint));
      return;
  }
}

export function printStringLog(logObj: LogObject): void {
  const formattedString = logObjectToString(logObj);
  switch (logObj.type) {
    case LogType.DEBUG:
      console.debug(chalk.yellow(formattedString));
      return;
    case LogType.INFO:
      console.info(chalk.white(formattedString));
      return;
    case LogType.WARN:
      console.warn(chalk.blue(formattedString));
      return;
    default:
      console.log(chalk.white(formattedString));
      return;
  }
}

export function getErrorLogObject(error: Error): ErrorLogObject {
  const timestamp = getUTCString();
  const message = error.message;
  const errorStack = error.stack || null;
  const errorKey = Date.now();

  const errorLogObject: ErrorLogObject = {
    timestamp,
    type: LogType.ERROR,
    errorKey,
    message,
    errorStack,
  };
  return errorLogObject;
}

export function errorObjectToString(errObj: ErrorLogObject): string {
  return `${errObj.timestamp} ${errObj.type}: Error Key - ${errObj.errorKey}, ${errObj.message}\n${errObj.errorStack}`;
}

export function printJsonError(errObj: ErrorLogObject): void {
  const jsonString = stringifyObject(errObj);
  console.log(chalk.red(jsonString));
  return;
}

export function printErrorString(errObj: ErrorLogObject): void {
  const formattedString = errorObjectToString(errObj);
  console.log(chalk.red(formattedString));
}

export function reqLogObjToString(reqLogObj: ReqLogObject) {
  const reqLogString = `${reqLogObj.timestamp}, ${LogType.REQUEST}: method - ${reqLogObj?.method}, url - ${
    reqLogObj?.url
  }, clientIp - ${reqLogObj?.clientIp}, ipFamily - ${reqLogObj?.ipFamily}, userAgent - ${
    reqLogObj?.userAgent
  }, httpVersion - ${reqLogObj?.httpVersion}, params - ${JSON.stringify(reqLogObj?.params)}, headers - ${JSON.stringify(
    reqLogObj?.headers,
  )}, body - ${JSON.stringify(reqLogObj?.body)}`;
  return reqLogString;
}

export function printReqLogJson(reqLogObj: ReqLogObject) {
  console.log(chalk.green(stringifyObject(reqLogObj)));
}
export function printReqLogString(reqLogObj: ReqLogObject) {
  const stringToPrint = reqLogObjToString(reqLogObj);
  console.log(chalk.green(stringToPrint));
}
export function stringifyObject(obj: any) {
  return JSON.stringify(obj, null, 2);
}
