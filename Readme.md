# Simple Logger

## Introdution

Hi, this is a small class library to mostly write logs to file and console. I didn't wanted to use bulky logging libraries which is why I just created my own. The usage is very simple, import the class and initialize it and then import and use the logging functions.

```ts
import SimpleLogger from "simple-logger";
/**
 * Intialize rgs:
 * 1. Cycle time in milliseconds
 * 2. Remove time in milliseconds
 * 3. Log directory path
 * 4. Log file name
 */

SimpleLogger.initLogs(
	86400000,
	604800000,
	path.join(__dirname, "./logs"),
	"seven_star_api.logs"
);
```

Once imported you can use it in any other file:

```ts
import SimpleLogger from "simple-logger";

SimpleLogger.log("Test logs");
```
