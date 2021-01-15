import { LogType } from '../enums/enums';

interface LogObject {
  timestamp: string;
  type: LogType;
  message: string;
}

export { LogObject };

interface ReqLogObject {
  timestamp: string;
  type: LogType;
  method: string | null;
  url: string | null;
  clientIp: string | null;
  ipFamily: string | null;
  userAgent: string | null;
  httpVersion: string | null;
  params: any | null;
  headers: any | null;
  body: any | null;
}

export { ReqLogObject };

interface ErrorLogObject {
  timestamp: string;
  type: LogType;
  errorKey: number;
  message: string;
  errorStack: string | null;
}

export { ErrorLogObject };

interface LogOptions {
  cycleTime?: number;
  removeTime?: number;
  logsDir?: string;
  logName?: string;
  writeToFile?: boolean;
  writeToConsole?: boolean;
  json?: boolean;
  beautifyJson?: boolean;
  handleSyncErrors?: boolean;
}

export { LogOptions };

interface ReqMidOptions {
  writeToFile?: boolean;
  writeToConsole?: boolean;
  hideBodyFields?: string[];
  hideHeaders?: string[];
  json?: boolean;
  handleSyncErrors?: boolean;
}

export { ReqMidOptions };
