# Simple Logger

Simple library to create logs

## Introduction

Hi, this is a small class library to mostly write logs to file and console. I didn't want to use bulky logging libraries which is why I just created my own. The usage is very simple, import the class and initialize it and then import and use the logging functions. All logging function write to console as well as write to a log file(only in the when NODE_ENV is set to test logs are not written to console).

New log file is created based on the _cycle time_. Log files older than the _Remove time_ are removed when new log file is created. If you don't initiate the logger, it will use the defaults. The defaults are the following:

1. Cycle time: 86400000 milliseconds or 1 day
2. Remove time: 604800000 milliseconds or 7 days
3. Log diretory: `./logs` i.e a new directory called logs in current directory will be created
4. Log file name: Defaults to `sds-simple-logger.logs`

```ts
import SimpleLogger from 'sds-simple-logger';

/**
 * Intialize args:
 * 1. Cycle time in milliseconds
 * 2. Remove time in milliseconds
 * 3. Log directory path
 * 4. Log file name
 */
SimpleLogger.initLogs(86400000, 604800000, path.join(__dirname, './logs'), 'sds-simple-logger.logs');
```

Once imported you can use it in any other file:

```ts
import SimpleLogger from 'sds-simple-logger';
// or
const SimpleLogger = require('sds-simple-logger');

SimpleLogger.log('Test logs');
```

### Methods Available:

All the methods available can take variable string messages or in other words are _variadic functions_ except the error method, which takes a error object as input. Error method also has an optional second argument which is false by default, if you want to exit the process with error, pass true as an second argument.

All the methods are asynchronous as we writing the logs to a file which is an async operation and returns a promise.

**Deprecation Warning: Staring version 1.0.0 methods will no longer return promises**

Instead of returning promises, any errors encountered while writting to file are handled internally by the library and printed to the console. This is because in future version of NodeJS, unhandled promise rejection will lead to Node exiting the process with non-zero error code. We don't want you to wrap every logging action with try and catch and add clutter to the code. Another benefit being that the code won't waste time on waiting to write to logs. This will happen asynchronously in the background.

#### **Debug**

Prints **DEBUG** in front the logs. Sample output:
`Tue, 05 Jan 2021 06:12:49 GMT: DEBUG: Debug output test`

Usage:

```ts
// Signature of function
// (...messages: string[]): Promise<boolean | Error>

SimpleLogger.debug('Debug test');
SimpleLogger.debug('Debug test one', 'Debug test two', 'Debug test three');
```

#### **Info**

Prints **INFO** in front the logs. Sample output:
`Tue, 05 Jan 2021 06:13:18 GMT: INFO: Info output test`

Usage:

```ts
// Signature of function
// (...messages: string[]): Promise<boolean | Error>

SimpleLogger.info('Info test');
SimpleLogger.info('Info test one', 'Info test two', 'Info test three');
```

#### **Warn**

Prints **WARN** in front the logs. Sample output:
`Tue, 05 Jan 2021 06:13:18 GMT: WARN: Warn output test`

Usage:

```ts
// Signature
// (...messages: string[]): Promise<boolean | Error>

SimpleLogger.warn('Warn test');
SimpleLogger.warn('Warn test one', 'Warn test two', 'Warn test three');
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
// (error: Error, exit: boolean = false): Promise<number | Error>;

SimpleLogger.error(new Error('Error test'));
SimpleLogger.error(new Error('Error test'), true);
```

#### Welcome to suggestions:

This library was created to simplfy the process of logging. Where are you want to do is log to console and file.
