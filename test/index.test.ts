import { expect } from 'chai';
import SimpleLogger from '../src/index';
import * as path from 'path';
import * as fs from 'fs';

describe('UNIT: Test import and initialization', () => {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  it('Should create a logs file if it does not exists', async function () {
    return new Promise(async (resolve, reject) => {
      try {
        await SimpleLogger.debug('Test');
        const logDirPath = path.join(process.env.PWD as string, 'logs');
        await delay(2000);
        expect(fs.existsSync(logDirPath)).to.be.true;
        return resolve();
      } catch (error) {
        return reject(error);
      }
    });
  });

  it('Should write a debug output to the logs', async () => {
    const result = await SimpleLogger.debug('Debug output goes here');
    expect(result).to.be.true;
  });

  it('Should write a info message to logs', async () => {
    const result = await SimpleLogger.info('Info message goes here');
    expect(result).to.be.true;
  });

  it('Should write a warn message to logs', async () => {
    const result = await SimpleLogger.info('Warn message goes here');
    expect(result).to.be.true;
  });

  it('Should write error stack to logs and return error key', async () => {
    const testError = new Error('This is a test error message');
    const errorKey = await SimpleLogger.error(testError);
    expect(errorKey).to.be.greaterThan(0);
  });
});
