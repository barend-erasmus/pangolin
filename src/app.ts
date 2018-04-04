import { IStorageProvider } from './write-ahead-log/interfaces/storage-provider';
import { LogEntry } from './write-ahead-log/models/log-entry';
import { InMemoryStorageProvider } from './write-ahead-log/storage-providers/in-memory';
import { WriteAheadLog } from './write-ahead-log/write-ahead-log';

const storageProvider: IStorageProvider = new InMemoryStorageProvider();

const writeAheadLog: WriteAheadLog = new WriteAheadLog(storageProvider);

writeAheadLog.command('1', 'SET 10');
writeAheadLog.command('1', 'SET 20');
writeAheadLog.commit('1');
writeAheadLog.command('2', 'SET 40');
writeAheadLog.command('2', 'SET 80');

const rollbackLogEntries: LogEntry[] = writeAheadLog.recover();

console.log(rollbackLogEntries);
