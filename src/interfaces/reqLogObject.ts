import { LogType } from '../enums/logType';

export default interface ReqLogObject {
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
