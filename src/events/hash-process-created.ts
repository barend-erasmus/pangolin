import { HashProcessEvent } from './hash-process';

export class HashProcessCreatedEvent extends HashProcessEvent {

    constructor(
        endValue: string,
        hash: string,
        lamportTimestamp: number,
        startValue: string,
    ) {
        super(endValue, hash, lamportTimestamp, startValue, 'created');
    }

}
