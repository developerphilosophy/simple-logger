# Simple Logger

Simple library to create logs

## Introduction

Simple logger is a simple library used to log to console and file. The usage is very simple, import the class and initialize it. You can use various logging methods available to create logs. Please note that initialization of logger is required and will throw an error when you use one of the available logging methods without first initializing the logs. If initialization was successful, it return **true** else throws an error. All operation related to files ex: writing to files, creation of file are synchronous.

```ts
import Logger from 'sds-simple-logger';

// Throw error if there was problem initializing logs using defaults
Logger.initLogs();

Logger.debug('Debug log');
Logger.info('Some info message');
Logger.warn('Some warning message');
Logger.error(new Error('Error message'));
```

Once imported and initialized, you can use it in any other file:

```ts
import Logger from 'sds-simple-logger';
// or
const Logger = require('sds-simple-logger');

Logger.log('Test logs');
```

### Options:

You can pass various options as an options object when initializing the logger. Options available:

1. _cycleTime_: The time in milliseconds after which a new log file should be created, defaults to 86400000 ms or 24 hrs
2. _removeTime_: The time in milliseconds, log files older than this will be removed. It runs with the cycle time, defaults to 604800000 ms or 7 days
3. _logsDir_: The path and name of logs directory. Defaults to creation of **logs** directory in the current directory
4. _writeToFile_: By default all logs are written to file as well as console(logs are not written to console if **NODE_ENV** is set to **"testing"**). It takes a boolean value and can be set to **false**, if you only want to write the logs to console. It is set to **true** by default.

Example:

```ts
Logger.initLogs({
  cycleTime: 86400000,
  removeTime: 86400000,
  logsDir: path.join(__dirname, '../test-logs'),
  logName: 'test.logs',
  writeToFile: true,
});
```

### Methods Available:

All the methods available can take variable string messages or in other words are _variadic functions_ except the error method, which takes only error object as input. For the error methods available you can pass a second argument i.e a boolean value of true. If you want to log the error and exit the Node process.

#### **Debug**

Prints **DEBUG** in front the logs. Sample output:
`Tue, 05 Jan 2021 06:12:49 GMT: DEBUG: Debug output test`

Usage:

```ts
// Signature of function
// (...messages: string[])
// Throw error if there was problem writing to logs

Logger.debug('Debug test');
Logger.debug('Debug test one', 'Debug test two', 'Debug test three');
```

#### **Info**

Prints **INFO** in front the logs. Sample output:
`Tue, 05 Jan 2021 06:13:18 GMT: INFO: Info output test`

Usage:

```ts
// Signature of function
// (...messages: string[])
// Throw error if there was problem writing to logs

Logger.info('Info test');
Logger.info('Info test one', 'Info test two', 'Info test three');
```

#### **Log**

Prints **LOG** in front the logs. Sample output:
`Tue, 05 Jan 2021 06:13:18 GMT: INFO: Info output test`

Usage:

```ts
// Signature of function
// (...messages: string[])
// Throw error if there was problem writing to logs

Logger.log('Log test');
Logger.log('Log test one', 'Log test two', 'Log test three');
```

#### **Warn**

Prints **WARN** in front the logs. Sample output:
`Tue, 05 Jan 2021 06:13:18 GMT: WARN: Warn output test`

Usage:

```ts
// Signature
// (...messages: string[])
// Throw error if there was problem writing to logs

Logger.warn('Warn test');
Logger.warn('Warn test one', 'Warn test two', 'Warn test three');
```

#### **Error**

Prints **Error** in front the logs and also prints the error stack. Along with this it also print a unique error key. If you want to exit the node process after printing the error pass true as the second arg. Sample output:

```
Tue, 05 Jan 2021 06:13:18 GMT: ERROR KEY: 1609827198551
Error: Error output test
  at main (/Users/someuser/Projects/Personal/Testing/index.ts:7:16)
  at Object.<anonymous> (/Users/someuser/Projects/Personal/Testing/index.ts:11:1)
  at Module.\_compile (internal/modules/cjs/loader.js:1015:30)
  at Module.m.\_compile (/usr/local/lib/node_modules/ts-node/src/index.ts:858:23)
  at Module.\_extensions..js (internal/modules/cjs/loader.js:1035:10)
  at Object.require.extensions.<computed> [as .ts] (/usr/local/lib/node_modules/ts-node/src/index.ts:861:12)
  at Module.load (internal/modules/cjs/loader.js:879:32)
  at Function.Module.\_load (internal/modules/cjs/loader.js:724:14)
  at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:60:12)
  at main (/usr/local/lib/node_modules/ts-node/src/bin.ts:227:14)
```

Usage:

```ts
// Signature
// (error: Error, exit: boolean = false): number;
// Throw error if there was problem writing to logs

Logger.error(new Error('Error test'));
// Exit the node process with non-zero exit code
Logger.error(new Error('Error test'), true);
```

#### **Prune Logs**

To prune logs i.e deleting the log directory and its content. You can use the _pruneLogs_ method available. Method returns _true_ if successfully deleted.

The next time you use a logging method available. The logs directory will be created according to the options passed in the _initLogs_ function.

```ts
Logger.pruneLogs();
```
