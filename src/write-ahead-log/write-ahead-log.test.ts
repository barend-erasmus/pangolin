import { expect } from 'chai';
import 'mocha';
import { IStorageProvider } from './interfaces/storage-provider';
import { LogEntry } from './models/log-entry';
import { InMemoryStorageProvider } from './storage-providers/in-memory';
import { WriteAheadLog } from './write-ahead-log';

describe('WriteAheadLog', () => {

    let writeAheadLog: WriteAheadLog = null;

    before(() => {
        const storageProvider: IStorageProvider = new InMemoryStorageProvider();
        writeAheadLog = new WriteAheadLog(storageProvider);
    });

    describe('recover', () => {

        it('should return 2 log entries', async () => {
            writeAheadLog.command('1', 'SET 10');
            writeAheadLog.command('1', 'SET 20');
            writeAheadLog.commit('1');
            writeAheadLog.command('2', 'SET 40');
            writeAheadLog.command('2', 'SET 80');

            const rollbackLogEntries: LogEntry[] = writeAheadLog.recover();

            expect(rollbackLogEntries.length).to.be.eq(2);
        });

    });

});
