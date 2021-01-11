const LogsNotInitaizedError = new Error('Logs not initialized. Need to initialize before using');
export { LogsNotInitaizedError };

const LogsAlreadyInitializedError = new Error('Logs already initialized, cannot initialize again');

export { LogsAlreadyInitializedError };
