import { IStorageProvider } from '../interfaces/storage-provider';
import { LogEntry } from '../models/log-entry';

export class InMemoryStorageProvider implements IStorageProvider {

    protected logEntries: LogEntry[] = [];

    public logEntryAt(index: number): LogEntry {
        if (this.logEntries.length - 1 - index < 0) {
            return null;
        }

        return this.logEntries[this.logEntries.length - 1 - index];
    }

    public write(logEntry: LogEntry): void {
        this.logEntries.push(logEntry);
    }

}
