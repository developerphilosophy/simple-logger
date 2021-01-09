import { expect } from 'chai';
import SimpleLogger from '../src/index';
import * as path from 'path';
import * as fs from 'fs';
const fsPromises = fs.promises;

describe('UNIT: Test import and initialization', () => {
  let logDirPath: string;
  let logFile: string;
  let delayTime: number = 1000;

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  it('Should create a logs file if it does not exists', async () => {
    SimpleLogger.debug('Test');
    logDirPath = path.join(process.env.PWD as string, 'logs');
    logFile = `${logDirPath}/sds-simple-logger.logs`;

    await delay(delayTime);

    expect(fs.existsSync(logDirPath)).to.be.true;
  });

  it('Should write a debug output to the logs', async () => {
    const message = 'Debug output goes here';
    SimpleLogger.debug(message);

    await delay(delayTime);

    const content: string = await fsPromises.readFile(logFile, 'utf-8');
    expect(content.includes(message)).to.be.true;
    console.log('Is this running: ', content.includes(message));
  });

  it('Should write a info message to logs', async () => {
    const message = 'Info message goes here';
    SimpleLogger.info(message);

    await delay(delayTime);

    const content: string = await fsPromises.readFile(logFile, 'utf-8');
    expect(content.includes(message)).to.be.true;
  });

  it('Should write a warn message to logs', async () => {
    const message = 'Warn message goes here';
    SimpleLogger.info(message);

    await delay(delayTime);

    const content: string = await fsPromises.readFile(logFile, 'utf-8');
    expect(content.includes(message)).to.be.true;
  });

  it('Should write error stack to logs and return error key', async () => {
    const message = 'This is a test error message';
    const testError = new Error(message);
    const errorKey = SimpleLogger.error(testError);
    expect(errorKey).to.be.greaterThan(0);

    await delay(delayTime);

    const content: string = await fsPromises.readFile(logFile, 'utf-8');
    expect(content.includes(message)).to.be.true;
  });
});
