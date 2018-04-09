import * as fs from 'fs';
import * as stream from 'stream';
import { IStorageProvider } from '../interfaces/storage-provider';
import { LogEntry } from '../models/log-entry';

export class DiskStorageProvider implements IStorageProvider {

    protected logSize: number = 24;

    protected offset: number = 0;

    protected fileDescriptor: number = null;

    constructor(
        protected fileName: string,
    ) {
        this.fileDescriptor = fs.openSync(this.fileName, 'w');
    }

    public logEntryAt(index: number): LogEntry {
        return null;
    }

    public write(logEntry: LogEntry): void {
        fs.writeSync(this.fileDescriptor, Buffer.from(`${logEntry.id}|${logEntry.payload}|${logEntry.type}`), 0, undefined, this.offset);

        this.offset += this.logSize;
    }

}
