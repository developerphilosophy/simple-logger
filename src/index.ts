import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { printErrorToConsole, getUTCString, printToConsole } from './lib/utilFunctions';
import { LogsNotInitaizedError, LogsAlreadyInitializedError } from './lib/errors';
import { Request, Response, NextFunction } from 'express';
import { LogType } from './enums/logType';
import LogOptions from './interfaces/logOptions';
import ReqMidOptions from './interfaces/reqMidOptions';
import ReqLogObject from './interfaces/reqLogObject';

class SimpleLogger {
  private static _logName: string = 'sds-simple-logger.logs';
  private static _logsDir: string = path.join(process.env.PWD as string, 'logs'); // Deaults to current directory
  private static _isInitialized: boolean = false;
  private static _env: string = process.env.NODE_ENV || 'development';
  private static _cycleTime: number = 86400000;
  private static _removeTime: number = 604800000;
  private static _writeToFile: boolean = true;
  private static _logsDirExists: boolean = false;
  private static _json: boolean = true;

  public static initLogs(options: LogOptions = {}): boolean {
    if (this._isInitialized) throw LogsAlreadyInitializedError;
    /**
     * 1. Set the time
     * 2. Initialize the log name
     * 3. Create the logs directory
     */
    if (typeof options.cycleTime !== 'undefined') this._cycleTime = options.cycleTime;
    if (typeof options.removeTime !== 'undefined') this._removeTime = options.removeTime;
    if (typeof options.logsDir !== 'undefined') this._logsDir = options.logsDir;
    if (typeof options.logName !== 'undefined') this._logName = options.logName;
    if (typeof options.writeToFile !== 'undefined') this._writeToFile = options.writeToFile;
    if (typeof options.json !== 'undefined') this._json = options.json;

    if (!this._logName.includes('.logs')) {
      console.log(chalk.yellow('By convention it is always recommeded to add .logs extension to log files'));
    }

    try {
      if (!this._isInitialized) {
        this.createLogDir();
      }
      this.logFileInit();
    } catch (error) {
      printErrorToConsole(error);
      throw error;
    }

    this.cycleLogs();
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
      printErrorToConsole(error);
      throw error;
    }
  }

  private static cycleLogs(): void {
    this.logFileInit();
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
      throw error;
    }
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
  /**
   * All the logging functions
   */
  public static debug(...messages: string[]): void {
    if (!this._isInitialized) throw LogsNotInitaizedError;

    try {
      for (const message of messages) {
        const logObject = printToConsole({ logType: LogType.DEBUG, message, json: this._json });

        if (this._writeToFile) this.writeToLogFile(logObject, this._json);
      }
    } catch (error) {
      throw error;
    }
  }

  public static info(...messages: string[]): void {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    try {
      for (const message of messages) {
        const logObject = printToConsole({ logType: LogType.INFO, message, json: this._json });

        if (this._writeToFile) this.writeToLogFile(logObject, this._json);
      }
    } catch (error) {
      throw error;
    }
  }
  public static log(...messages: string[]): void {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    try {
      for (const message of messages) {
        const logObject = printToConsole({ logType: LogType.LOG, message, json: this._json });

        if (this._writeToFile) this.writeToLogFile(logObject, this._json);
      }
    } catch (error) {
      throw error;
    }
  }

  public static warn(...messages: string[]): void {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    try {
      for (const message of messages) {
        const logObject = printToConsole({ logType: LogType.WARN, message, json: this._json });

        if (this._writeToFile) this.writeToLogFile(logObject, this._json);
      }
    } catch (error) {
      throw error;
    }
  }

  public static error(error: Error, exit: boolean = false): number {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    let key: number;
    try {
      const logObject = printToConsole({
        logType: LogType.ERROR,
        message: error.message,
        error: error,
        json: this._json,
      });
      key = logObject.key;
      if (this._writeToFile) this.writeToLogFile(logObject.data, this._json);
      if (exit) {
        return process.exit(1);
      } else {
        return key;
      }
    } catch (error) {
      throw error;
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
      let json: boolean = this._json;
      let hideBodyFields: string[] = [];
      let hideHeaders: string[] = [];

      if (typeof opts.writeToFile !== 'undefined') writeToFile = opts.writeToFile;
      if (typeof opts.hideBodyFields !== 'undefined') hideBodyFields = opts.hideBodyFields;
      if (typeof opts.hideHeaders !== 'undefined') hideHeaders = opts.hideHeaders;
      if (typeof opts.json !== 'undefined') json = opts.json;

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
        const returnValue = printToConsole({ logType: LogType.REQUEST, dataObject, json });
        if (writeToFile) this.writeToLogFile(returnValue, json);
        return nxt();
      } catch (error) {
        return nxt(error);
      }
    };
  }
}

export default SimpleLogger;
