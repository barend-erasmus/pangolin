import * as fs from 'fs';
import * as stream from 'stream';
import { IStorageProvider } from '../interfaces/storage-provider';
import { LogEntry } from '../models/log-entry';

export class InMemoryBufferStorageProvider implements IStorageProvider {

    protected logEntries: LogEntry[] = [];

    constructor(
        protected bufferSize: number,
        protected storageProvider: IStorageProvider,
    ) {

    }

    public close(): void {
        this.storageProvider.close();
    }

    public async logEntryAt(index: number): Promise<LogEntry> {
        if (this.logEntries.length - (index + 1) >= 0) {
            return this.logEntries[this.logEntries.length - (index + 1)];
        }

        return this.storageProvider.logEntryAt(index - this.logEntries.length);
    }

    public async sync(): Promise<void> {
        for (const logEntry of this.logEntries) {
            await this.storageProvider.write(logEntry);
        }

        await this.storageProvider.sync();
    }

    public async write(logEntry: LogEntry): Promise<void> {
        this.logEntries.push(logEntry);

        if (this.logEntries.length >= this.bufferSize) {
            await this.sync();
            this.logEntries = [];
        }
    }

}
