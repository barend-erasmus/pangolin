import { IStorageProvider } from '../../../write-ahead-log/interfaces/storage-provider';
import { DiskStorageProvider } from '../../../write-ahead-log/storage-providers/disk';
import { WriteAheadLog } from '../../../write-ahead-log/write-ahead-log';

const storageProvider: IStorageProvider = new DiskStorageProvider(false, './my-file.log');
const writeAheadLog: WriteAheadLog = new WriteAheadLog(storageProvider);

const numberOfLogEntries: number = 1000000;

const startTimestamp: number = new Date().getTime();

for (let count = 0; count < numberOfLogEntries; count ++) {
    writeAheadLog.command(count, 'SET 1');
}

const endTimestamp: number = new Date().getTime();

console.log(`${endTimestamp - startTimestamp} ms`);
console.log(`${numberOfLogEntries / (endTimestamp - startTimestamp) * 1000} per second`);
