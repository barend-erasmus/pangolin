import { AlphaNumericCounter } from './alpha-numeric-counter';
import { HashProcessEvent } from './events/hash-process';
import { HashProcessCompletedEvent } from './events/hash-process-completed';
import { HashProcessCreatedEvent } from './events/hash-process-created';
import { HashProcessStartedEvent } from './events/hash-process-started';
import { HashProcess } from './models/hash-process';

export class DataStore {

    public hashProcessEvents: HashProcessEvent[] = [];

    public lamportTimestamp: number = 0;

    constructor() {

    }

    public addEvent(event: HashProcessEvent): HashProcessEvent {
        if (event.lamportTimestamp > this.lamportTimestamp) {
            this.lamportTimestamp = event.lamportTimestamp;

            this.hashProcessEvents.push(event);

            return event;
        }

        return null;
    }

    public compileHashProcessess(): HashProcess[] {
        const hashProcesses: HashProcess[] = [];

        for (const event of this.hashProcessEvents) {
            let hashProcess: HashProcess = hashProcesses.find((x) => x.endValue === event.endValue && x.hash === event.hash && x.startValue === event.startValue);

            if (!hashProcess && event.type !== 'created') {
                continue;
            } else if (!hashProcess) {
                hashProcess = new HashProcess(false, null, event.lamportTimestamp, event.endValue, event.hash, false, null, null, event.startValue);
                hashProcesses.push(hashProcess);
            }

            if (event.type === 'completed') {
                hashProcess.completed = true;
                hashProcess.completedTimestamp = event.lamportTimestamp;
                hashProcess.inProgress = false;
                hashProcess.result = (event as HashProcessCompletedEvent).result;
            } else if (event.type === 'started') {
                hashProcess.inProgress = true;
                hashProcess.startTimestamp = event.lamportTimestamp;
            }
        }

        return hashProcesses;
    }

    public compressHashProcessEvents(): HashProcessEvent[] {
        const compileHashProcessess: HashProcess[] = this.compileHashProcessess();

        const events: HashProcessEvent[] = [];

        for (const hashProcess of compileHashProcessess) {
            events.push(new HashProcessCreatedEvent(hashProcess.endValue, hashProcess.hash, hashProcess.createdTimestamp, hashProcess.startValue));

            if (hashProcess.inProgress) {
                events.push(new HashProcessStartedEvent(hashProcess.endValue, hashProcess.hash, hashProcess.startTimestamp, hashProcess.startValue));
            }

            if (hashProcess.completed) {
                events.push(new HashProcessCompletedEvent(hashProcess.endValue, hashProcess.hash, hashProcess.completedTimestamp, hashProcess.result, hashProcess.startValue));
            }
        }

        return events;
    }

    public findExpiredHashProcess(): HashProcess {
        const compileHashProcessess: HashProcess[] = this.compileHashProcessess();

        const expiredHashProcessess: HashProcess[] = compileHashProcessess.filter((hashProcess: HashProcess) => !hashProcess.completed && hashProcess.inProgress && hashProcess.startTimestamp + 100 < this.lamportTimestamp);

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

            const startValue: string = alphaNumericCounter.incrementBy(401);
            const endValue: string = alphaNumericCounter.incrementBy(400);

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

}
