import { expect } from 'chai';
import 'mocha';
import { IStorageProvider } from './interfaces/storage-provider';
import { LogEntry } from './models/log-entry';
import { DiskStorageProvider } from './storage-providers/disk';
import { InMemoryStorageProvider } from './storage-providers/in-memory';
import { WriteAheadLog } from './write-ahead-log';
import { InMemoryBufferStorageProvider } from './storage-providers/in-memory-buffer';

describe('WriteAheadLog - DiskStorageProvider', () => {

    let writeAheadLog: WriteAheadLog = null;

    afterEach(() => {
        writeAheadLog.close();
        writeAheadLog = null;
    });

    beforeEach(() => {
        const storageProvider: IStorageProvider = new DiskStorageProvider(true, './test-1.log');
        writeAheadLog = new WriteAheadLog(storageProvider);
    });

    describe('recover', () => {

        it('should return 2 log entries', async () => {
            await writeAheadLog.command(1, 'SET 10');
            await writeAheadLog.command(1, 'SET 20');
            await writeAheadLog.commit(1);
            await writeAheadLog.command(2, 'SET 40');
            await writeAheadLog.command(2, 'SET 80');

            const rollbackLogEntries: LogEntry[] = await writeAheadLog.recover();

            expect(rollbackLogEntries.length).to.be.eq(2);
        });

    });

});

describe('WriteAheadLog - InMemoryStorageProvider', () => {

    let writeAheadLog: WriteAheadLog = null;

    afterEach(() => {
        writeAheadLog.close();
        writeAheadLog = null;
    });

    beforeEach(() => {
        const storageProvider: IStorageProvider = new InMemoryStorageProvider();
        writeAheadLog = new WriteAheadLog(storageProvider);
    });

    describe('recover', () => {

        it('should return 2 log entries', async () => {
            await writeAheadLog.command(1, 'SET 10');
            await writeAheadLog.command(1, 'SET 20');
            await writeAheadLog.commit(1);
            await writeAheadLog.command(2, 'SET 40');
            await writeAheadLog.command(2, 'SET 80');

            const rollbackLogEntries: LogEntry[] = await writeAheadLog.recover();

            expect(rollbackLogEntries.length).to.be.eq(2);
        });

    });

});

describe('WriteAheadLog - InMemoryBufferStorageProvider', () => {

    let writeAheadLog: WriteAheadLog = null;

    afterEach(() => {
        writeAheadLog.close();
        writeAheadLog = null;
    });

    beforeEach(() => {
        const storageProvider: IStorageProvider = new InMemoryBufferStorageProvider(50, new DiskStorageProvider(true, './test-2.log'));
        writeAheadLog = new WriteAheadLog(storageProvider);
    });

    describe('recover', () => {

        it('should return 2 log entries', async () => {
            await writeAheadLog.command(1, 'SET 10');
            await writeAheadLog.command(1, 'SET 20');
            await writeAheadLog.commit(1);
            await writeAheadLog.command(2, 'SET 40');
            await writeAheadLog.command(2, 'SET 80');

            const rollbackLogEntries: LogEntry[] = await writeAheadLog.recover();

            expect(rollbackLogEntries.length).to.be.eq(2);
        });

    });

});
