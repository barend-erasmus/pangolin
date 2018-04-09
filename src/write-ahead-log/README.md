# Write-Ahead Log

[Write-Ahead Log for Dummies](http://work.tinou.com/2012/09/write-ahead-log.html)

## Usage Example

```typescript
const storageProvider: IStorageProvider = new InMemoryStorageProvider();
const writeAheadLog = new WriteAheadLog(storageProvider);

await writeAheadLog.command(1, 'SET 10');
await writeAheadLog.command(1, 'SET 20');
await writeAheadLog.commit(1);
await writeAheadLog.command(2, 'SET 40');
await writeAheadLog.command(2, 'SET 80');

const rollbackLogEntries: LogEntry[] = await writeAheadLog.recover();
```