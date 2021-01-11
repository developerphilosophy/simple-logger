import { expect } from 'chai';
import SimpleLogger from '../src/index';
import * as path from 'path';
import * as fs from 'fs';
const fsPromises = fs.promises;

describe('UNIT: Test import and initialization', () => {
  const logFileName = 'sds-simple-logger.logs';
  const logDirPath = path.join(process.env.PWD as string, 'logs');
  const logs = `${logDirPath}/${logFileName}`;

  it('Should initialize logs directory and path', () => {
    SimpleLogger.initLogs();
    console.log('Logs full path: ', logs);
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
});
