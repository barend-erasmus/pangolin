import { IStorageProvider } from '../../../write-ahead-log/interfaces/storage-provider';
import { DiskStorageProvider } from '../../../write-ahead-log/storage-providers/disk';
import { HorizontalParitioningStorageProvider } from '../../../write-ahead-log/storage-providers/horizontal-partitioning';
import { InMemoryStorageProvider } from '../../../write-ahead-log/storage-providers/in-memory';
import { InMemoryBufferStorageProvider } from '../../../write-ahead-log/storage-providers/in-memory-buffer';
import { WriteAheadLog } from '../../../write-ahead-log/write-ahead-log';

(async () => {

    const storageProviders: {} = {
        disk: new DiskStorageProvider(true, 'C:/Temp/my-file-disk-1.log'),
        horizontalParitioningStorageProvider: new HorizontalParitioningStorageProvider([
            new DiskStorageProvider(false, 'C:/Temp/my-file-horizontal-paritioning-1.log'),
            new DiskStorageProvider(false, 'C:/Temp/my-file-horizontal-paritioning-2.log'),
            new DiskStorageProvider(false, 'C:/Temp/my-file-horizontal-paritioning-3.log'),
        ]),
        inMemory: new InMemoryStorageProvider(),
        inMemoryBuffer100: new InMemoryBufferStorageProvider(100, new DiskStorageProvider(false, 'C:/Temp/my-file-in-memory-100.log')),
        inMemoryBuffer1000: new InMemoryBufferStorageProvider(1000, new DiskStorageProvider(false, 'C:/Temp/my-file-in-memory-1000.log')),
        inMemoryBuffer2000: new InMemoryBufferStorageProvider(2000, new DiskStorageProvider(false, 'C:/Temp/my-file-in-memory-2000.log')),
        inMemoryBuffer50: new InMemoryBufferStorageProvider(50, new DiskStorageProvider(false, 'C:/Temp/my-file-in-memory-50.log')),
        inMemoryBuffer500: new InMemoryBufferStorageProvider(500, new DiskStorageProvider(false, 'C:/Temp/my-file-in-memory-500.log')),
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
