import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { printErrorToConsole, getUTCString } from './lib/utilFunctions';
import { LogsNotInitaizedError } from './lib/errors';

interface LogOptions {
  cycleTime?: number;
  removeTime?: number;
  logsDir?: string;
  logName?: string;
  writeToFile?: boolean;
}

class SimpleLogger {
  private static _logName: string = 'sds-simple-logger.logs';
  private static _logsDir: string = path.join(process.env.PWD as string, 'logs'); // Deaults to current directory
  private static _isInitialized: boolean = false;
  private static _env: string = process.env.NODE_ENV || 'development';
  private static _cycleTime: number = 86400000;
  private static _removeTime: number = 604800000;
  private static _writeToFile: boolean = true;

  public static initLogs(options: LogOptions = {}) {
    /**
     * 1. Set the time
     * 2. Initialize the log name
     * 3. Create the logs directory
     */
    if (options && options.cycleTime) this._cycleTime = options.cycleTime;
    if (options && options.removeTime) this._removeTime = options.removeTime;
    if (options && options.logsDir) this._logsDir = options.logsDir;
    if (options && options.logName) this._logName = options.logName;
    if (options && options.writeToFile) this._writeToFile = options.writeToFile;

    if (!this._logName.includes('.logs')) {
      console.log(chalk.yellow('By convention it is always recommeded to add .logs extension to log files'));
    }

    if (!this._isInitialized) {
      try {
        this.createLogDir();
      } catch (error) {
        printErrorToConsole(error);
        throw error;
      }
    }
    this.logFileInit();
    this.cycleLogs();
    this._isInitialized = true;
  }

  /**
   * Create the logs directory
   */
  private static createLogDir() {
    if (!fs.existsSync(this._logsDir)) {
      // Check to see if logs directory already exists or not
      try {
        fs.mkdirSync(this._logsDir);
      } catch (error) {
        throw error;
      }
    }
  }

  private static logFileInit() {
    const _logName = path.join(this._logsDir, this._logName);
    try {
      fs.appendFileSync(_logName, `\n*** New Logging Session Started Created on(UTC time): ${getUTCString()}***\n`);
    } catch (error) {
      printErrorToConsole(error);
      throw error;
    }
  }

  private static cycleLogs() {
    this.logFileInit();
    setInterval(() => {
      let date = new Date().toLocaleDateString();
      let time = new Date().toLocaleTimeString();
      time = time.replace(/ /g, '').replace(/:/g, '');
      date = date.replace(/\s+|[,\/]/g, '');
      fs.rename(
        path.join(this._logsDir, `${this._logName}`),
        path.join(this._logsDir, `${this._logName}.${date}.${time}`),
        (error) => {
          if (error) printErrorToConsole(error);
          this.logFileInit();
        },
      );
      this.removeOldLogs();
    }, this._cycleTime);
    // For 24 hours: 86400000
  }

  private static removeOldLogs() {
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

  private static writeToLogFile(message: string) {
    const fullLogPath: string = this.getFullLogPath();
    const UTCString: string = getUTCString();

    try {
      fs.accessSync(fullLogPath);
      if (!fs.existsSync(this._logsDir)) {
        fs.mkdirSync(this._logsDir, { recursive: true });
      }
      fs.appendFileSync(this.getFullLogPath(), `${UTCString}: ${message}\n`);
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
  public static debug(...messages: string[]) {
    if (!this._isInitialized) throw LogsNotInitaizedError;

    try {
      for (const message of messages) {
        const formattedMessage = `DEBUG: ${chalk.yellow(message)}`;
        if (this._env !== 'test') console.log(formattedMessage);

        if (this._writeToFile) this.writeToLogFile(`DEBUG: ${message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  public static info(...messages: string[]) {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    try {
      for (const message of messages) {
        const formattedMessage = `INFO: ${chalk.green(message)}`;
        if (this._env !== 'test') console.log(formattedMessage);

        if (this._writeToFile) this.writeToLogFile(`INFO: ${message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  public static warn(...messages: string[]) {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    try {
      for (const message of messages) {
        const formattedMessage = `WARN: ${chalk.cyanBright(message)}`;
        if (this._env !== 'test') console.log(formattedMessage);
        if (this._writeToFile) this.writeToLogFile(`WARN: ${message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  public static error(error: Error, exit: boolean = false): number {
    if (!this._isInitialized) throw LogsNotInitaizedError;
    try {
      const key = Date.now();
      const formattedMessage = `ERROR: Error Key: ${key}\n${chalk.red(error.message)}\nStack trace: ${chalk.red(
        error.stack ? error.stack : '',
      )}`;

      if (this._env !== 'test') console.error(formattedMessage);

      if (this._writeToFile) this.writeToLogFile(`ERROR KEY: ${key}\n${error.stack ? error.stack : ''}`);
      if (exit) {
        return process.exit(1);
      } else {
        return key;
      }
    } catch (error) {
      throw error;
    }
  }
}

export default SimpleLogger;
