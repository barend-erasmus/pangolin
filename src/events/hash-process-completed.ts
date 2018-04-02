import { HashProcessEvent } from './hash-process';

export class HashProcessCompletedEvent extends HashProcessEvent {

    constructor(
        endValue: string,
        hash: string,
        lamportTimestamp: number,
        public result: string,
        startValue: string,
    ) {
        super(endValue, hash, lamportTimestamp, startValue, 'completed');
    }

}
