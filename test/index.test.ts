import { expect } from 'chai';
import SimpleLogger from '../src/index';
import * as path from 'path';
import * as fs from 'fs';

describe('UNIT: Test initialization and use of variable logging methods', () => {
  let logFileName = 'sds-simple-logger.logs';
  let logDirPath = path.join(process.env.PWD as string, 'logs');
  let logs = `${logDirPath}/${logFileName}`;

  function initLogs() {
    SimpleLogger.initLogs();
  }

  it('Should throw an error if logs not initialized before calling log methods', () => {
    try {
      SimpleLogger.debug('This is a test');
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.be.equal('Logs not initialized. Need to initialize before using');
    }
  });

  it('Should initialize logs directory and path', () => {
    initLogs();
    expect(fs.existsSync(logDirPath)).to.be.true;
    expect(fs.existsSync(logs)).to.be.true;
  });

  it('Should write a debug output to the logs', () => {
    const message = `${new Date()} debug log`;
    SimpleLogger.debug(message);
    const content: string = fs.readFileSync(logs, 'utf-8');
    expect(content.includes(message)).to.be.true;
  });

  it('Should write a info message to logs', async () => {
    const message = `${new Date()} info log`;
    SimpleLogger.info(message);
    const content: string = fs.readFileSync(logs, 'utf-8');
    expect(content.includes(message)).to.be.true;
  });

  it('Should write a log message to logs', async () => {
    const message = `${new Date()} log`;
    SimpleLogger.log(message);
    const content: string = fs.readFileSync(logs, 'utf-8');
    expect(content.includes(message)).to.be.true;
  });

  it('Should write a warn message to logs', async () => {
    const message = `${new Date()} warn log`;
    SimpleLogger.warn(message);
    const content: string = fs.readFileSync(logs, 'utf-8');
    expect(content.includes(message)).to.be.true;
  });

  it('Should write error stack to logs and return error key', () => {
    const message = `${new Date()} error log`;
    const testError = new Error(message);
    const errorKey: number = SimpleLogger.error(testError);
    const content: string = fs.readFileSync(logs, 'utf-8');
    expect(content.includes(message)).to.be.true;
    expect(content.includes(errorKey.toString())).to.be.true;
    expect(errorKey).to.be.greaterThan(0);
  });

  it('Should prune logs folder', () => {
    SimpleLogger.pruneLogs();
    expect(fs.existsSync(logDirPath)).to.be.false;
  });

  it('Should create the logs directory and file when one of the logging method is called after pruning logs', () => {
    SimpleLogger.log('Test dir creation');
    expect(fs.existsSync(logDirPath)).to.be.true;
  });

  it('Should throw error if trying to initialize logs again', () => {
    try {
      SimpleLogger.initLogs();
    } catch (error) {
      expect(error.message).to.be.equal('Logs already initialized, cannot initialize again');
    }
  });
});
