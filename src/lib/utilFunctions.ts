import chalk from 'chalk';

export function printErrorToConsole(error: Error) {
  return console.error(chalk.red(error.message), '\n', error);
}

export function getUTCString(): string {
  return new Date().toUTCString();
}
