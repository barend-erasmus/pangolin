import { LogEntry } from '../models/log-entry';

export interface IStorageProvider {
    logEntryAt(index: number): LogEntry;
    write(logEntry: LogEntry): void;
}
