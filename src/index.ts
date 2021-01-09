import { rejects } from 'assert';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

class SimpleLogger {
  private static _logName: string = 'sds-simple-logger.logs';
  private static _logsDir: string = path.join(process.env.PWD as string, 'logs'); // Defaults to two folders up in the root directory
  private static _isInitialized: boolean = false;
  private static _env: string = process.env.NODE_ENV || 'development';
  private static _cycleTime: number = 86400000;
  private static _removeTime: number = 604800000;

  public static initLogs(
    cycleTime: number,
    removeTime: number,
    logsDir: string,
    logName: string = 'SimpleLogger.logs',
  ) {
    /**
     * 1. Set the time
     * 2. Initialize the log name
     * 3. Create the logs directory
     */
    this._cycleTime = cycleTime;
    this._removeTime = removeTime;
    this._logsDir = logsDir;

    if (!logName.includes('.logs')) {
      console.log(chalk.yellow('By convention it is always recommeded to add .logs extension to log files'));
    }

    this._logName = logName;
    if (!this._isInitialized) {
      this.createLogDir();
    }
    this.logFileInit();
    this.cycleLogs();
    this._isInitialized = true;
  }

  private static createLogDir() {
    if (!fs.existsSync(this._logsDir)) {
      // Check to see if logs directory already exists or not
      try {
        fs.mkdirSync(this._logsDir);
      } catch (error) {
        this.printErrorToConsole(error);
        process.exit(1);
      }
    }
  }

  private static logFileInit() {
    const _logName = path.join(this._logsDir, this._logName);
    try {
      fs.appendFileSync(_logName, `\n*** New Logs Start. Created on UTC time: ${this.getUTCString()}***\n`);
    } catch (error) {
      this.printErrorToConsole(error);
      process.exit(1);
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
          if (error) this.printErrorToConsole(error);
          this.logFileInit();
        },
      );
      this.removeOldLogs();
    }, this._cycleTime);
    // For 24 hours: 86400000
  }

  private static removeOldLogs() {
    fs.readdir(this._logsDir, (errorOne, files) => {
      if (errorOne) this.printErrorToConsole(errorOne);
      files.forEach((file, index) => {
        fs.stat(path.join(this._logsDir, file), (errorTwo, stat) => {
          if (errorTwo) return this.printErrorToConsole(errorTwo);
          const now = new Date().getTime();
          const endTime = new Date(stat.ctime).getTime() + this._removeTime;
          // For 7 days: 604800000
          if (now > endTime) {
            fs.unlink(path.join(this._logsDir, file), (errorThree) => {
              if (errorThree) return this.printErrorToConsole(errorThree);
              const dateTime = new Date().toLocaleString();
              return console.log(chalk.green(`${dateTime}: Olds logs pruned successfully`));
            });
          }
        });
      });
    });
  }

  private static writeToLogFile(message: string, isExit: boolean = false) {
    const fullLogPath: string = this.getFullLogPath();
    const UTCString: string = this.getUTCString();

    fs.access(fullLogPath, (errorOne) => {
      if (errorOne) {
        this.printErrorToConsole(errorOne);

        fs.mkdir(this._logsDir, (errorTwo) => {
          if (errorTwo && errorTwo.errno !== -17) {
            this.printErrorToConsole(errorTwo);
          }

          fs.appendFile(this.getFullLogPath(), `${UTCString}: ${message}\n`, (errorThree) => {
            if (errorThree) this.printErrorToConsole(errorThree);
            if (isExit) process.exit(1);
          });
        });
      } else {
        fs.appendFile(this.getFullLogPath(), `${UTCString}: ${message}\n`, (errorFour) => {
          if (errorFour) this.printErrorToConsole(errorFour);
          if (isExit) process.exit(1);
        });
      }
    });
  }

  private static printErrorToConsole(error: Error) {
    return console.error(chalk.red(error.message), '\n', error);
  }

  private static getUTCString(): string {
    return new Date().toUTCString();
  }

  private static getFullLogPath(): string {
    return path.join(this._logsDir, this._logName);
  }
  /**
   * All the logging functions
   */
  public static debug(...messages: string[]): void {
    for (const message of messages) {
      const formattedMessage = `DEBUG: ${chalk.yellow(message)}`;
      if (this._env !== 'test') {
        console.log(formattedMessage);
      }
      this.writeToLogFile(`DEBUG: ${message}`);
    }
  }

  public static info(...messages: string[]): void {
    for (const message of messages) {
      const formattedMessage = `INFO: ${chalk.green(message)}`;
      if (this._env !== 'test') {
        console.log(formattedMessage);
      }
      this.writeToLogFile(`INFO: ${message}`);
    }
  }

  public static warn(...messages: string[]) {
    for (const message of messages) {
      const formattedMessage = `WARN: ${chalk.cyanBright(message)}`;
      if (this._env !== 'test') {
        console.log(formattedMessage);
      }
      this.writeToLogFile(`WARN: ${message}`);
    }
  }

  public static error(error: Error, exit: boolean = false): number {
    const key = Date.now();
    const formattedMessage = `ERROR: Error Key: ${key}\n${chalk.red(error.message)}\nStack trace: ${chalk.red(
      error.stack ? error.stack : '',
    )}`;

    if (this._env !== 'test') {
      console.error(formattedMessage);
    }
    this.writeToLogFile(`ERROR KEY: ${key}\n${error.stack ? error.stack : ''}`);
    if (exit) return process.exit(1);
    return key;
  }
}

export default SimpleLogger;
