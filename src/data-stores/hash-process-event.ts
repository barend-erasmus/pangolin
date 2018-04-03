import { HashProcessEvent } from '../events/hash-process';
import { HashProcessCompletedEvent } from '../events/hash-process-completed';
import { HashProcess } from '../models/hash-process';

export class HashProcessEventDataStore {

    private hashProcessess: HashProcess[] = [];

    private hashProcessEvents: HashProcessEvent[] = [];

    constructor() {

    }

    public appendHashProcessEvent(hashProcessEvent: HashProcessEvent): boolean {
        const lastHashProcessEventIndex: number = this.hashProcessEvents.length === 0 ? -1 : this.hashProcessEvents[this.hashProcessEvents.length - 1].index;

        if (lastHashProcessEventIndex + 1 !== hashProcessEvent.index) {
            return false;
        }

        this.hashProcessEvents.push(hashProcessEvent);

        this.applyHashProcessEvent(hashProcessEvent);

        return true;
    }

    public compileHashProcessess(hashProcessEvents: HashProcessEvent[]): HashProcess[] {
        const hashProcesses: HashProcess[] = [];

        for (const hashProcessEvent of hashProcessEvents) {
            let hashProcess: HashProcess = hashProcesses.find((x) => x.endValue === hashProcessEvent.endValue && x.hash === hashProcessEvent.hash && x.startValue === hashProcessEvent.startValue);

            if (!hashProcess && hashProcessEvent.type !== 'created') {
                continue;
            } else if (!hashProcess) {
                hashProcess = new HashProcess(false, hashProcessEvent.endValue, hashProcessEvent.hash, false, null, hashProcessEvent.startValue);
                hashProcesses.push(hashProcess);
            }

            if (hashProcessEvent.type === 'completed') {
                hashProcess.completed = true;
                hashProcess.inProgress = false;
                hashProcess.result = (hashProcessEvent as HashProcessCompletedEvent).result;
            } else if (hashProcessEvent.type === 'started') {
                hashProcess.inProgress = true;
            }
        }

        return hashProcesses;
    }

    public getLastHashProcessEventIndex(): number {
        const lastHashProcessEventIndex: number = this.hashProcessEvents.length === 0 ? -1 : this.hashProcessEvents[this.hashProcessEvents.length - 1].index;

        return lastHashProcessEventIndex;
    }

    public findExpiredHashProcess(): HashProcess {
        const compileHashProcessess: HashProcess[] = this.compileHashProcessess();

        const expiredHashProcessess: HashProcess[] = compileHashProcessess.filter((hashProcess: HashProcess) => !hashProcess.completed && hashProcess.inProgress && hashProcess.startTimestamp + 10000 < this.lamportTimestamp);

        return expiredHashProcessess.length === 0 ? null : expiredHashProcessess[0];
    }

    public findUnprocessedHashProcess(): HashProcess {
        const compiledHashProcessess: HashProcess[] = this.compileHashProcessess();

        const unprocessedHashProcessess: HashProcess[] = compiledHashProcessess.filter((hashProcess: HashProcess) => !hashProcess.completed && !hashProcess.inProgress);

        return unprocessedHashProcessess.length === 0 ? null : unprocessedHashProcessess[0];
    }

    public nextHashProcess(): HashProcess {
        const unresolvedHashProcesses: HashProcess[] = this.unresolvedHashProcesses();

        const completedHashProcessess: HashProcess[] = unresolvedHashProcesses.filter((hashProcess: HashProcess) => hashProcess.completed);

        for (const hashProcess of completedHashProcessess) {
            const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(hashProcess.startValue);

            const startValue: string = alphaNumericCounter.incrementBy(8000 + 1);
            const endValue: string = alphaNumericCounter.incrementBy(8000);

            const existingHashProcess: HashProcess = unresolvedHashProcesses.find((x) => x.endValue === endValue && x.hash === hashProcess.hash && x.startValue === startValue);

            if (!existingHashProcess) {
                return new HashProcess(false, null, this.lamportTimestamp, endValue, hashProcess.hash, false, null, null, startValue);
            }
        }

        return null;
    }

    public unresolvedHashProcesses(): HashProcess[] {
        const compiledHashProcessess: HashProcess[] = this.compileHashProcessess();

        return compiledHashProcessess.filter((hashProcess: HashProcess) => compiledHashProcessess.filter((x) => x.hash === hashProcess.hash && x.result).length === 0);
    }

    private applyHashProcessEvent(hashProcessEvent: HashProcessEvent): void {
        let hashProcess: HashProcess = null;

        if (hashProcessEvent.type === 'created') {
            hashProcess = new HashProcess(false, hashProcessEvent.endValue, hashProcessEvent.hash, false, null, hashProcessEvent.startValue);
            this.hashProcessess.push(hashProcess);

            return;
        }

        hashProcess = this.hashProcessess.find((x) => x.endValue === hashProcessEvent.endValue && x.hash === hashProcess.hash && hashProcess.startValue === hashProcess.startValue);

        if (hashProcess) {
            if (hashProcessEvent.type === 'completed') {
                hashProcess.completed = true;
                hashProcess.inProgress = false;
                hashProcess.result = (hashProcessEvent as HashProcessCompletedEvent).result;
            } else if (event.type === 'started') {
                hashProcess.inProgress = true;
            }
        }
    }
}
