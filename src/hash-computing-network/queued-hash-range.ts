import { HashRange } from './hash-range';

export class QueuedHashRange extends HashRange {

    constructor(end: string, start: string, public timestamp: Date) {
        super(end, start);
    }

}
