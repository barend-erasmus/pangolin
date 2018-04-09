import { LogEntry } from '../models/log-entry';

export interface IStorageProvider {
    close(): void;
    logEntryAt(index: number): Promise<LogEntry>;
    write(logEntry: LogEntry): Promise<void>;
}
