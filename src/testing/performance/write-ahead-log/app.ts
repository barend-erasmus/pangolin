import { IStorageProvider } from '../../../write-ahead-log/interfaces/storage-provider';
import { DiskStorageProvider } from '../../../write-ahead-log/storage-providers/disk';
import { InMemoryStorageProvider } from '../../../write-ahead-log/storage-providers/in-memory';
import { InMemoryBufferStorageProvider } from '../../../write-ahead-log/storage-providers/in-memory-buffer';
import { WriteAheadLog } from '../../../write-ahead-log/write-ahead-log';

(async () => {

    const storageProviders: {} = {
        disk: new DiskStorageProvider(true, 'C:/Temp/my-file-1.log'),
        inMemory: new InMemoryStorageProvider(),
        inMemoryBuffer100: new InMemoryBufferStorageProvider(100, new DiskStorageProvider(false, 'C:/Temp/my-file-3.log')),
        inMemoryBuffer1000: new InMemoryBufferStorageProvider(1000, new DiskStorageProvider(false, 'C:/Temp/my-file-5.log')),
        inMemoryBuffer2000: new InMemoryBufferStorageProvider(2000, new DiskStorageProvider(false, 'C:/Temp/my-file-6.log')),
        inMemoryBuffer50: new InMemoryBufferStorageProvider(50, new DiskStorageProvider(false, 'C:/Temp/my-file-2.log')),
        inMemoryBuffer500: new InMemoryBufferStorageProvider(500, new DiskStorageProvider(false, 'C:/Temp/my-file-4.log')),
    };

    for (const key of Object.keys(storageProviders)) {
        const storageProvider: IStorageProvider = storageProviders[key];
        const writeAheadLog: WriteAheadLog = new WriteAheadLog(storageProvider);

        const numberOfLogEntries: number = 5000;

        const writeStartTimestamp: number = new Date().getTime();

        for (let count = 0; count < numberOfLogEntries; count++) {
            await writeAheadLog.command(count, 'SET 1');
        }

        const writeEndTimestamp: number = new Date().getTime();

        const readStartTimestamp: number = new Date().getTime();

        const rollbackLogEntries = await writeAheadLog.recover();

        const readEndTimestamp: number = new Date().getTime();

        writeAheadLog.close();

        console.log(`${key}:`);
        console.log(`           Write: ${writeEndTimestamp - writeStartTimestamp} ms (${numberOfLogEntries / (writeEndTimestamp - writeStartTimestamp) * 1000} per second)`);
        console.log(`           Read: ${readEndTimestamp - readStartTimestamp} ms (${numberOfLogEntries / (readEndTimestamp - readStartTimestamp) * 1000} per second)`);
    }
})();
