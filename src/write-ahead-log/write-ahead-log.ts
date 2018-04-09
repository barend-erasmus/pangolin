import { IStorageProvider } from './interfaces/storage-provider';
import { LogEntry } from './models/log-entry';

export class WriteAheadLog {

    constructor(
        protected storageProvider: IStorageProvider,
    ) {

    }

    public close(): void {
        this.storageProvider.close();
    }

    public async abort(id: number): Promise<void> {
        await this.storageProvider.write(new LogEntry(id, null, 'abort'));
    }

    public async command(id: number, payload: any): Promise<void> {
        await this.storageProvider.write(new LogEntry(id, payload, 'command'));
    }

    public async commit(id: number): Promise<void> {
        await this.storageProvider.write(new LogEntry(id, null, 'commit'));
    }

    public async recover(): Promise<LogEntry[]> {
        const rollbackLogEntries: LogEntry[] = [];

        let logEntryIndex: number = 0;

        let logEntry: LogEntry = await this.storageProvider.logEntryAt(logEntryIndex);

        const abortedIds: number[] = [];

        const committedIds: number[] = [];

        while (logEntry) {
            if (logEntry.type === 'commit') {
                committedIds.push(logEntry.id);
            } else if (logEntry.type === 'abort') {
                abortedIds.push(logEntry.id);
            } else if (logEntry.type === 'command') {
                const hasBeenAborted: boolean = abortedIds.indexOf(logEntry.id) > -1;

                const hasBeenCommitted: boolean = committedIds.indexOf(logEntry.id) > -1;

                if (!hasBeenAborted && !hasBeenCommitted) {
                    rollbackLogEntries.push(logEntry);
                }
            }

            logEntryIndex ++;

            logEntry = await this.storageProvider.logEntryAt(logEntryIndex);
        }

        logEntryIndex = 0;

        return rollbackLogEntries;
    }

}
