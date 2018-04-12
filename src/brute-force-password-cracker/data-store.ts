import { VectorClock } from '../vector-clock/vector-clock';
import { Hash } from './models/hash';
import { HashAttempt } from './models/hash-attempt';
import { LogEntry } from './models/log-entry';

export class DataStore {

    protected logEntries: LogEntry[] = null;

    constructor(
        protected vectorClock: VectorClock,
    ) {
        this.logEntries = [];
    }

    public getHashes(): Hash[] {
        const hashes: Hash[] = [];

        for (const logEntry of this.logEntries) {
            if (logEntry.type === 'hash') {
                const hash: Hash = new Hash([], logEntry.payload.value);

                const existingHash: Hash = hashes.find((x: Hash) => x.value === hash.value);

                if (existingHash) {

                } else {
                    hashes.push(hash);
                }
            }

            if (logEntry.type === 'hash-attempt') {
                const hashAttempt: HashAttempt = new HashAttempt(logEntry.payload.end, logEntry.payload.hashValue, logEntry.payload.lastProcessedTimestamp, logEntry.payload.processed, logEntry.payload.result, logEntry.payload.start);

                const existingHash: Hash = hashes.find((x: Hash) => x.value === hashAttempt.hashValue);

                if (existingHash) {
                    const existingHashAttempt: HashAttempt = existingHash.attempts.find((x: HashAttempt) => x.end === hashAttempt.end && x.start === hashAttempt.start);

                    if (existingHashAttempt) {
                        existingHashAttempt.lastProcessedTimestamp = hashAttempt.lastProcessedTimestamp;
                        existingHashAttempt.processed = hashAttempt.processed;
                        existingHashAttempt.result = hashAttempt.result;
                    } else {
                        existingHash.attempts.push(hashAttempt);
                    }
                }
            }
        }

        return hashes;
    }

    public getLogEntries(): LogEntry[] {
        return this.logEntries;
    }

    public insertLogEntry(logEntry: LogEntry): void {
        if (!this.logEntries.find((x) => x.id === logEntry.id)) {
            const index: number = this.logEntries.filter((x: LogEntry) => VectorClock.compare(x.vectorClock, logEntry.vectorClock) <= 0).length;

            this.logEntries.splice(index, 0, logEntry);

            this.vectorClock.increment();
            this.vectorClock.merge(logEntry.vectorClock);
        }
    }

}
