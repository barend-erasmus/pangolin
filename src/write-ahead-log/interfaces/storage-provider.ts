import { LogEntry } from '../models/log-entry';

export interface IStorageProvider {
    close(): void;
    logEntryAt(index: number): Promise<LogEntry>;
    sync(): Promise<void>;
    write(logEntry: LogEntry): Promise<void>;
}
