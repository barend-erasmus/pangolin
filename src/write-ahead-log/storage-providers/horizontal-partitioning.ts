import * as fs from 'fs';
import * as stream from 'stream';
import { Mutex } from '../../mutal-exclusion/mutex';
import { IStorageProvider } from '../interfaces/storage-provider';
import { LogEntry } from '../models/log-entry';

export class HorizontalParitioningStorageProvider implements IStorageProvider {

    protected mutexes: {} = {};

    constructor(
        protected storageProviders: IStorageProvider[],
    ) {

    }

    public close(): void {
        for (const storageProvider of this.storageProviders) {
            storageProvider.close();
        }
    }

    public async logEntryAt(index: number): Promise<LogEntry> {
        for (const storageProvider of this.storageProviders) {
            const logEntry: LogEntry = await storageProvider.logEntryAt(index);

            if (logEntry) {
                return logEntry;
            }
        }

        return null;
    }

    public async sync(): Promise<void> {
        for (const storageProvider of this.storageProviders) {
            await storageProvider.sync();
        }
    }

    public async write(logEntry: LogEntry): Promise<void> {
        const slot: number = this.getSlot(logEntry.id);

        if (!this.mutexes[slot]) {
            this.mutexes[slot] = new Mutex();
        }

        await (this.mutexes[slot] as Mutex).wait();

        this.storageProviders[slot].write(logEntry).then(() => {
            (this.mutexes[slot] as Mutex).release();
        });
    }

    protected getSlot(id: number): number {
        return id % this.storageProviders.length;
    }

}
