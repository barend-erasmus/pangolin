import { LogEntry } from '../models/log-entry';

export interface ILogEntryHandler {

    handle(logEntry: LogEntry): Promise<void>;

}
