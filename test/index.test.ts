import { expect } from 'chai';
import SimpleLogger from '../src/index';
import * as path from 'path';
import * as fs from 'fs';

describe('UNIT: Test import and initialization', () => {
  // it('Should create a logs file if it does not exists', function () {
  //   SimpleLogger.debug('Test');
  //   const logDirPath = path.join(process.env.PWD as string, 'logs');
  //   expect(fs.existsSync(logDirPath)).to.be.true;
  // });

  it('Should write a debug output to the logs', () => {
    const result = SimpleLogger.debug('Debug output goes here');
    expect(result).to.be.true;
  });

  it('Should write a info message to logs', () => {
    const result = SimpleLogger.info('Info message goes here');
    expect(result).to.be.true;
  });

  it('Should write a warn message to logs', () => {
    const result = SimpleLogger.info('Warn message goes here');
    expect(result).to.be.true;
  });

  it('Should write error stack to logs and return error key', () => {
    const testError = new Error('This is a test error message');
    const errorKey = SimpleLogger.error(testError);
    expect(errorKey).to.be.greaterThan(0);
  });
});
