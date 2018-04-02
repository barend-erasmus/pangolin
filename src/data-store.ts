import { AlphaNumericCounter } from './alpha-numeric-counter';
import { HashProcessResult } from './models/hash-process-result';
import { LogEntry } from './models/log-entry';

export class DataStore {

    private hashProcessResults: HashProcessResult[] = [];

    public lamportTimestamp: number = 0;

    constructor() {

    }

    public addLogEntry(entry: LogEntry): void {
        if (entry.lamportTimestamp > this.lamportTimestamp) {
            this.lamportTimestamp = entry.lamportTimestamp;

            const existingHashProcessResult: HashProcessResult = this.hashProcessResults.find((hashProcessResult: HashProcessResult) => hashProcessResult.endValue === entry.data.endValue && hashProcessResult.hash === entry.data.hash && hashProcessResult.startValue === entry.data.startValue);

            if (existingHashProcessResult) {
                existingHashProcessResult.completed = entry.data.completed;
                existingHashProcessResult.inProgress = entry.data.inProgress;
                existingHashProcessResult.result = entry.data.result;
            } else {
                this.hashProcessResults.push(entry.data);
            }
        }
    }

    public findExpiredHashProcessResult(): HashProcessResult {
        const expiredHashProcessResults: HashProcessResult[] = this.getUnresolvedHashProcessResults().filter((hashProcessResult: HashProcessResult) => !hashProcessResult.completed && hashProcessResult.inProgress && hashProcessResult.startTimestamp + 100 < this.lamportTimestamp);

        return expiredHashProcessResults.length === 0 ? null : expiredHashProcessResults[0];
    }

    public findUnprocessedHashProcessResult(): HashProcessResult {
        const unprocessedHashProcessResults: HashProcessResult[] = this.getUnresolvedHashProcessResults().filter((hashProcessResult: HashProcessResult) => !hashProcessResult.completed && !hashProcessResult.inProgress);

        return unprocessedHashProcessResults.length === 0 ? null : unprocessedHashProcessResults[0];
    }

    public nextHashProcessResult(): HashProcessResult {
        const completedHashProcessResults: HashProcessResult[] = this.getUnresolvedHashProcessResults().filter((hashProcessResult: HashProcessResult) => hashProcessResult.completed);

        for (const hashProcessResult of completedHashProcessResults) {
            const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(hashProcessResult.startValue);

            const startValue: string = alphaNumericCounter.incrementBy(401);
            const endValue: string = alphaNumericCounter.incrementBy(400);

            const existingHashProcessResult: HashProcessResult = this.hashProcessResults.find((x) => x.endValue === endValue && x.hash === hashProcessResult.hash && x.startValue === startValue);

            if (existingHashProcessResult) {

            } else {
                return new HashProcessResult(false, endValue, hashProcessResult.hash, false, null, null, startValue);
            }
        }
    }

    private getUnresolvedHashProcessResults(): HashProcessResult[] {
        const result: HashProcessResult[] = this.hashProcessResults.filter((hashProcessResult: HashProcessResult) => this.hashProcessResults.filter((x) => x.hash === hashProcessResult.hash && x.result).length === 0);

        return result;
    }
}
