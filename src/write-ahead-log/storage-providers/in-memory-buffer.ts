import * as fs from 'fs';
import * as stream from 'stream';
import { IStorageProvider } from '../interfaces/storage-provider';
import { LogEntry } from '../models/log-entry';
import { DiskStorageProvider } from './disk';

export class InMemoryBufferStorageProvider implements IStorageProvider {

    protected logEntries: LogEntry[] = [];

    constructor(
        protected bufferSize: number,
        protected diskStorageProvider: DiskStorageProvider,
    ) {

    }

    public close(): void {
        this.diskStorageProvider.close();
    }

    public async logEntryAt(index: number): Promise<LogEntry> {
        if (this.logEntries.length - (index + 1) > 0) {
            return this.logEntries[this.logEntries.length - (index + 1)];
        }

        return this.diskStorageProvider.logEntryAt(index);
    }

    public async write(logEntry: LogEntry): Promise<void> {
        this.logEntries.push(logEntry);

        if (this.logEntries.length > this.bufferSize) {
            await this.flush();
            this.logEntries = [];
        }
    }

    protected async flush(): Promise<void> {
        for (const logEntry of this.logEntries) {
            await this.diskStorageProvider.write(logEntry);
        }

        await this.diskStorageProvider.sync();
    }

}
