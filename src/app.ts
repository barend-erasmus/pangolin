import { IStorageProvider } from './write-ahead-log/interfaces/storage-provider';
import { DiskStorageProvider } from './write-ahead-log/storage-providers/disk';
import { InMemoryStorageProvider } from './write-ahead-log/storage-providers/in-memory';
import { InMemoryBufferStorageProvider } from './write-ahead-log/storage-providers/in-memory-buffer';
import { WriteAheadLog } from './write-ahead-log/write-ahead-log';

(async () => {

    const storageProviders: {} = {
        disk: new DiskStorageProvider(true, './my-file-1.log'),
        inMemory: new InMemoryStorageProvider(),
        inMemoryBuffer50: new InMemoryBufferStorageProvider(50, new DiskStorageProvider(false, './my-file-2.log')),
        inMemoryBuffer100: new InMemoryBufferStorageProvider(100, new DiskStorageProvider(false, './my-file-3.log')),
        inMemoryBuffer500: new InMemoryBufferStorageProvider(500, new DiskStorageProvider(false, './my-file-4.log')),
        inMemoryBuffer1000: new InMemoryBufferStorageProvider(1000, new DiskStorageProvider(false, './my-file-5.log')),
        inMemoryBuffer2000: new InMemoryBufferStorageProvider(2000, new DiskStorageProvider(false, './my-file-6.log')),
    };

    for (const key of Object.keys(storageProviders)) {
        const storageProvider: IStorageProvider = storageProviders[key];
        const writeAheadLog: WriteAheadLog = new WriteAheadLog(storageProvider);

        const numberOfLogEntries: number = 5000;

        const startTimestamp: number = new Date().getTime();

        for (let count = 0; count < numberOfLogEntries; count++) {
            await writeAheadLog.command(count, 'SET 1');
        }

        const endTimestamp: number = new Date().getTime();

        writeAheadLog.close();

        console.log(`${key}: ${endTimestamp - startTimestamp} ms (${numberOfLogEntries / (endTimestamp - startTimestamp) * 1000} per second)`);
    }
})();
