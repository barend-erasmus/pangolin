import { IStorageProvider } from '../interfaces/storage-provider';
import { LogEntry } from '../models/log-entry';

export class InMemoryStorageProvider implements IStorageProvider {

    protected logEntries: LogEntry[] = [];

    public close(): void {

    }

    public async logEntryAt(index: number): Promise<LogEntry> {
        if (this.logEntries.length - 1 - index < 0) {
            return null;
        }

        return this.logEntries[this.logEntries.length - 1 - index];
    }

    public async write(logEntry: LogEntry): Promise<void> {
        this.logEntries.push(logEntry);
    }

}
