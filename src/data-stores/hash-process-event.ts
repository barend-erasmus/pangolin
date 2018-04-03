import { AlphaNumericCounter } from '../alpha-numeric-counter';
import { HashProcessEvent } from '../events/hash-process';
import { HashProcessCompletedEvent } from '../events/hash-process-completed';
import { ConsoleLogger } from '../logger/console';
import { HashProcess } from '../models/hash-process';

export class HashProcessEventDataStore {

    protected hashProcessess: HashProcess[] = [];

    protected hashProcessEvents: HashProcessEvent[] = [];

    constructor(protected consoleLogger: ConsoleLogger) {

    }

    public appendHashProcessEvent(hashProcessEvent: HashProcessEvent): boolean {
        if (!this.validHashProcessEvent(hashProcessEvent)) {
            this.consoleLogger.debug(`appendHashProcessEvent(hashProcessEvent) => false`, hashProcessEvent);
            return false;
        }

        this.hashProcessEvents.push(hashProcessEvent);

        this.applyHashProcessEvent(hashProcessEvent);

        this.consoleLogger.debug(`appendHashProcessEvent(hashProcessEvent) => true`, hashProcessEvent);
        return true;
    }

    public getLastHashProcessEventsFromIndex(index: number): HashProcessEvent[] {
        return this.hashProcessEvents.filter((x) => x.index > index);
    }

    public getLastHashProcessEventIndex(): number {
        const lastHashProcessEventIndex: number = this.hashProcessEvents.length === 0 ? -1 : this.hashProcessEvents[this.hashProcessEvents.length - 1].index;

        return lastHashProcessEventIndex;
    }

    public findExpiredHashProcess(): HashProcess {
        const lastHashProcessEventIndex: number = this.getLastHashProcessEventIndex();

        const expiredHashProcessess: HashProcess[] = this.hashProcessess.filter((hashProcess: HashProcess) => !hashProcess.completed && hashProcess.inProgress && hashProcess.startIndex + 10000 < lastHashProcessEventIndex);

        return expiredHashProcessess.length === 0 ? null : expiredHashProcessess[0];
    }

    public findUnprocessedHashProcess(): HashProcess {
        const unprocessedHashProcessess: HashProcess[] = this.hashProcessess.filter((hashProcess: HashProcess) => !hashProcess.completed && !hashProcess.inProgress);

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
                return new HashProcess(false, endValue, hashProcess.hash, false, null, -1, startValue);
            }
        }

        return null;
    }

    public unresolvedHashProcesses(): HashProcess[] {
        return this.hashProcessess.filter((hashProcess: HashProcess) => this.hashProcessess.filter((x) => x.hash === hashProcess.hash && x.result).length === 0);
    }

    private applyHashProcessEvent(hashProcessEvent: HashProcessEvent): void {
        let hashProcess: HashProcess = null;

        if (hashProcessEvent.type === 'created') {
            hashProcess = new HashProcess(false, hashProcessEvent.endValue, hashProcessEvent.hash, false, null, -1, hashProcessEvent.startValue);
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
                hashProcess.startIndex = hashProcessEvent.index;
            }
        }
    }

    private validHashProcessEvent(hashProcessEvent: HashProcessEvent): boolean {
        const lastHashProcessEventIndex: number = this.hashProcessEvents.length === 0 ? -1 : this.hashProcessEvents[this.hashProcessEvents.length - 1].index;

        if (lastHashProcessEventIndex + 1 !== hashProcessEvent.index) {
            return false;
        }

        return true;
    }
}
