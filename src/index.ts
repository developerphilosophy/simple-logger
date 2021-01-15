import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import {
  printErrorToConsole,
  getUTCString,
  getLogObject,
  printJsonLog,
  printStringLog,
  logObjectToString,
  getErrorLogObject,
  printJsonError,
  printErrorString,
  printReqLogJson,
  printReqLogString,
  reqLogObjToString,
  errorObjectToString,
} from './lib/utilFunctions';
import { LogsNotInitaizedError, LogsAlreadyInitializedError, NotWritingAnyLogs } from './errors/errors';
import { Request, Response, NextFunction } from 'express';
import { LogType } from './enums/enums';
import { LogOptions, ReqMidOptions, ReqLogObject, LogObject } from './types/types';
import { clear } from 'console';

class SimpleLogger {
  private static _logName: string = 'sds-simple-logger.logs';
  private static _logsDir: string = path.join(process.env.PWD as string, 'logs'); // Deaults to current directory
  private static _isInitialized: boolean = false;
  private static _cycleTime: number = 86400000;
  private static _removeTime: number = 604800000;
  private static _writeToFile: boolean = true;
  private static _writeToConsole: boolean = true;
  private static _logsDirExists: boolean = false;
  private static _json: boolean = true;
  private static _handleSyncErrors: boolean = true;

  public static initLogs(opts: LogOptions = {}): boolean {
    if (this._isInitialized) throw LogsAlreadyInitializedError;
    /**
     * 1. Set the time
     * 2. Initialize the log name
     * 3. Create the logs directory
     */
    if (typeof opts.cycleTime !== 'undefined') this._cycleTime = opts.cycleTime;
    if (typeof opts.removeTime !== 'undefined') this._removeTime = opts.removeTime;
    if (typeof opts.logsDir !== 'undefined') this._logsDir = opts.logsDir;
    if (typeof opts.logName !== 'undefined') this._logName = opts.logName;
    if (typeof opts.writeToFile !== 'undefined') this._writeToFile = opts.writeToFile;
    if (typeof opts.writeToConsole !== 'undefined') this._writeToConsole = opts.writeToConsole;
    if (typeof opts.json !== 'undefined') this._json = opts.json;
    if (typeof opts.handleSyncErrors !== 'undefined') this._handleSyncErrors = opts.handleSyncErrors;

    if (!this._writeToConsole && !this._writeToFile) {
      console.warn(`Both ${chalk.blue('writeToConsole')} and ${chalk.blue('writeToFile')} are set to false`);
      throw NotWritingAnyLogs;
    }

    try {
      if (!this._isInitialized) {
        this.createLogDir();
      }
      this.logFileInit();
      this.cycleLogs();
    } catch (error) {
      printErrorToConsole(error);
      throw error;
    }

    this._isInitialized = true;
    return true;
  }

  /**
   * Create the logs directory
   */
  private static createLogDir(): void {
    try {
      if (!fs.existsSync(this._logsDir)) {
        // If log directory does not exists, create one
        fs.mkdirSync(this._logsDir);
        this._logsDirExists = true;
      }
    } catch (error) {
      throw error;
    }
  }

  private static logFileInit(): void {
    const logName = path.join(this._logsDir, this._logName);
    try {
      fs.appendFileSync(logName, `\n*** New Logging Session Started Created on(UTC time): ${getUTCString()}***\n`);
    } catch (error) {
      throw error;
    }
  }

  private static cycleLogs(): void {
    try {
      this.logFileInit();
    } catch (error) {
      printErrorToConsole(error);
    }

    setInterval(() => {
      let date = new Date().toLocaleDateString();
      let time = new Date().toLocaleTimeString();
      time = time.replace(/ /g, '').replace(/:/g, '');
      date = date.replace(/\s+|[,\/]/g, '');

      const oldPath = path.join(this._logsDir, `${this._logName}`);
      const newPath = path.join(this._logsDir, `${this._logName}.${date}.${time}`);

      fs.rename(oldPath, newPath, (error) => {
        if (error) printErrorToConsole(error);
        this.logFileInit();
      });
      this.removeOldLogs();
    }, this._cycleTime);
    // For 24 hours: 86400000
  }

  private static removeOldLogs(): void {
    fs.readdir(this._logsDir, (errorOne, files) => {
      if (errorOne) printErrorToConsole(errorOne);
      files.forEach((file, index) => {
        fs.stat(path.join(this._logsDir, file), (errorTwo, stat) => {
          if (errorTwo) return printErrorToConsole(errorTwo);
          const now = new Date().getTime();
          const endTime = new Date(stat.ctime).getTime() + this._removeTime;
          // For 7 days: 604800000
          if (now > endTime) {
            fs.unlink(path.join(this._logsDir, file), (errorThree) => {
              if (errorThree) return printErrorToConsole(errorThree);
              const dateTime = new Date().toLocaleString();
              return console.log(chalk.green(`${dateTime}: Olds logs pruned successfully`));
            });
          }
        });
      });
    });
  }

  private static writeToLogFile(message: any, json: boolean = true): void {
    const fullLogPath: string = this.getFullLogPath();
    const UTCString: string = getUTCString();

    try {
      if (!this._logsDirExists || !fs.existsSync(this._logsDir)) {
        fs.mkdirSync(this._logsDir, { recursive: true });
      }
      if (json) {
        fs.appendFileSync(this.getFullLogPath(), `${JSON.stringify(message, null, 2)},\n`);
      } else {
        fs.appendFileSync(this.getFullLogPath(), `${message}\n`);
      }
    } catch (error) {
      throw error;
    }
  }

  private static getFullLogPath(): string {
    return path.join(this._logsDir, this._logName);
  }

  private static writeLogsFactory(logObj: LogObject) {
    if (this._writeToConsole) {
      if (this._json) {
        printJsonLog(logObj);
      } else {
        printStringLog(logObj);
      }
    }

    if (this._writeToFile) {
      if (this._json) {
        this.writeToLogFile(logObj, true);
      } else {
        const logString = logObjectToString(logObj);
        this.writeToLogFile(logString, false);
      }
    }
  }

  /**
   * Exposed functions
   */
  public static pruneLogs(): boolean {
    if (!this._isInitialized) throw LogsNotInitaizedError;

    try {
      // 1. Delete the content of directory
      const dirContent = fs.readdirSync(this._logsDir);
      dirContent.forEach((file) => {
        fs.unlinkSync(path.join(this._logsDir, file));
      });
      // 2. Remove the directory
      fs.rmdirSync(this._logsDir);
      this._logsDirExists = false;
      return true;
    } catch (error) {
      if (this._handleSyncErrors) {
        throw error;
      } else {
        printErrorToConsole(error);
        return false;
      }
    }
  }
  /**
   * All the logging functions
   */
  public static debug(...messages: string[]): void {
    if (!this._isInitialized) throw LogsNotInitaizedError;

    try {
      for (const message of messages) {
        const logObj = getLogObject(LogType.DEBUG, message);
        this.writeLogsFactory(logObj);
      }
    } catch (error) {
      if (this._handleSyncErrors) {
        throw error;
      } else {
        printErrorToConsole(error);
      }
    }
  }

  public static info(...messages: string[]): void {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    try {
      for (const message of messages) {
        const logObj = getLogObject(LogType.INFO, message);
        this.writeLogsFactory(logObj);
      }
    } catch (error) {
      if (this._handleSyncErrors) {
        throw error;
      } else {
        printErrorToConsole(error);
      }
    }
  }
  public static log(...messages: string[]): void {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    try {
      for (const message of messages) {
        const logObj = getLogObject(LogType.LOG, message);
        this.writeLogsFactory(logObj);
      }
    } catch (error) {
      if (this._handleSyncErrors) {
        throw error;
      } else {
        printErrorToConsole(error);
      }
    }
  }

  public static warn(...messages: string[]): void {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    try {
      for (const message of messages) {
        const logObj = getLogObject(LogType.WARN, message);
        this.writeLogsFactory(logObj);
      }
    } catch (error) {
      if (this._handleSyncErrors) {
        throw error;
      } else {
        printErrorToConsole(error);
      }
    }
  }

  public static error(error: Error, exit: boolean = false): number {
    if (!this._isInitialized) throw LogsNotInitaizedError;

    let errorKey = 0;

    try {
      const errorLogObject = getErrorLogObject(error);
      errorKey = errorLogObject.errorKey;

      if (this._writeToConsole) {
        if (this._json) {
          printJsonError(errorLogObject);
        } else {
          printErrorString(errorLogObject);
        }
      }

      if (this._writeToFile) {
        if (this._json) {
          this.writeToLogFile(errorLogObject, true);
        } else {
          const errorString = errorObjectToString(errorLogObject);
          this.writeToLogFile(errorString, false);
        }
      }
      return errorLogObject.errorKey;
    } catch (error) {
      if (this._handleSyncErrors) {
        throw error;
      } else {
        printErrorToConsole(error);
        return errorKey;
      }
    }
  }

  public static expressReqLogs(opts: ReqMidOptions = {}) {
    return (req: Request, res: Response, nxt: NextFunction) => {
      if (!this._isInitialized) throw LogsNotInitaizedError;
      const { headers, httpVersion, method, socket, url, body, params } = req;
      const { remoteAddress, remoteFamily } = socket;

      const requestMethod = method || null;
      const requestUrl = url || null;
      const requestIpAddress = remoteAddress || null;
      const requestUserAgent = req.get('user-agent') || null;
      const requestBody = req.body || null;
      const requestParams = req.params || null;
      const requestHeaders = headers || null;
      const requestHttpVersion = httpVersion || null;
      const requestRemoteFamily = remoteFamily || null;

      let writeToFile: boolean = this._writeToFile;
      let writeToConsole: boolean = this._writeToConsole;
      let json: boolean = this._json;
      let hideBodyFields: string[] = [];
      let hideHeaders: string[] = [];
      let handleSyncErrors = this._handleSyncErrors;

      if (typeof opts.writeToFile !== 'undefined') writeToFile = opts.writeToFile;
      if (typeof opts.writeToConsole !== 'undefined') writeToConsole = opts.writeToConsole;
      if (typeof opts.hideBodyFields !== 'undefined') hideBodyFields = opts.hideBodyFields;
      if (typeof opts.hideHeaders !== 'undefined') hideHeaders = opts.hideHeaders;
      if (typeof opts.json !== 'undefined') json = opts.json;
      if (typeof opts.handleSyncErrors !== 'undefined') handleSyncErrors = opts.handleSyncErrors;

      /**
       * Delete hiddens fields based on middleware settings
       */
      if (hideBodyFields.length > 0) {
        hideBodyFields.forEach((field) => {
          delete body[field];
        });
      }

      if (hideHeaders.length > 0) {
        hideHeaders.forEach((field) => {
          delete requestHeaders[field];
        });
      }

      const dataObject: ReqLogObject = {
        timestamp: getUTCString(),
        type: LogType.REQUEST,
        method: requestMethod,
        url: requestUrl,
        clientIp: requestIpAddress,
        ipFamily: requestRemoteFamily,
        userAgent: requestUserAgent,
        httpVersion: requestHttpVersion,
        params: requestParams,
        headers: requestHeaders,
        body: requestBody,
      };

      try {
        if (this._writeToConsole) {
          if (json) {
            printReqLogJson(dataObject);
          } else {
            printReqLogString(dataObject);
          }
        }

        if (this._writeToFile) {
          if (json) {
            this.writeToLogFile(dataObject, true);
          } else {
            const errorString = reqLogObjToString(dataObject);
            this.writeToLogFile(errorString, false);
          }
        }

        return nxt();
      } catch (error) {
        if (handleSyncErrors) {
          return nxt(error);
        } else {
          printErrorToConsole(error);
          return nxt();
        }
      }
    };
  }
}

export default SimpleLogger;
