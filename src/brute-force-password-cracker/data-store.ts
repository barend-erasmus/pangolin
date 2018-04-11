import { VectorClock } from '../vector-clock/vector-clock';
import { LogEntry } from './models/log-entry';

export class DataStore {

    protected logEntries: LogEntry[] = null;

    constructor(
        protected vectorClock: VectorClock,
    ) {
        this.logEntries = [];
    }

    public getLogEntries(): LogEntry[] {
        return this.logEntries;
    }

    public insertLogEntry(logEntry: LogEntry): void {
        if (!this.logEntries.find((x) => x.id === logEntry.id)) {
            this.logEntries.push(logEntry);

            this.vectorClock.increment();
            this.vectorClock.merge(logEntry.vectorClock);

            this.logEntries = this.logEntries.sort((a: LogEntry, b: LogEntry) => {
                return VectorClock.compare(a.vectorClock, b.vectorClock);
            });
        }
    }
}
