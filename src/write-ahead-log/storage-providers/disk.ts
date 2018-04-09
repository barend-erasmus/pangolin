import * as fs from 'fs';
import * as stream from 'stream';
import { IStorageProvider } from '../interfaces/storage-provider';
import { LogEntry } from '../models/log-entry';

export class DiskStorageProvider implements IStorageProvider {

    protected logSize: number = 24;

    protected offset: number = 0;

    protected fileDescriptor: number = null;

    constructor(
        protected autoSync: boolean,
        protected fileName: string,
    ) {
        this.fileDescriptor = fs.openSync(this.fileName, 'w+');
    }

    public close(): void {
        fs.closeSync(this.fileDescriptor);
        fs.unlinkSync(this.fileName);
    }

    public async logEntryAt(index: number): Promise<LogEntry> {
        const buffer: Buffer = await this.fsRead(index);

        if (buffer) {
            const splitedString: string[] = buffer.toString().replace(/\0/g, '').split('|');

            return new LogEntry(parseInt(splitedString[0], 10), JSON.parse(splitedString[1]), splitedString[2]);
        }

        return null;
    }

    public sync(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.fsync(this.fileDescriptor, (err: Error) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    public async write(logEntry: LogEntry): Promise<void> {
        await this.fsWrite(logEntry);

        if (this.autoSync) {
            await this.sync();
        }

        this.offset += this.logSize;
    }

    protected fsRead(index: number): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const buffer: Buffer = new Buffer(this.logSize);

            const position: number = this.offset - (this.logSize * (index + 1));

            if (position < 0) {
                resolve(null);
                return;
            }

            fs.read(this.fileDescriptor, buffer, 0, this.logSize, position, (err: Error, bytesRead: number, bf: Buffer) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(buffer);
            });
        });
    }

    protected fsWrite(logEntry: LogEntry): Promise<void> {
        return new Promise((resolve, reject) => {
            const buffer: Buffer = Buffer.from(`${logEntry.id}|${JSON.stringify(logEntry.payload)}|${logEntry.type}`);

            fs.write(this.fileDescriptor, buffer, 0, buffer.length, this.offset, (err: Error, written: number, bf: Buffer) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

}
