const LogsNotInitaizedError = new Error('Logs not initialized. Need to initialize before using');
export { LogsNotInitaizedError };

const LogsAlreadyInitializedError = new Error('Logs already initialized, cannot initialize again');

export { LogsAlreadyInitializedError };

const NotWritingAnyLogs = new Error(
  'Both writeToFile and writeToLog are set to false. At least one needs to be true, to actually write logs',
);

export { NotWritingAnyLogs };
