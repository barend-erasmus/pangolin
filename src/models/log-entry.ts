import { HashProcessResult } from './hash-process-result';

export class LogEntry {

    constructor(
        public data: HashProcessResult,
        public lamportTimestamp: number,
    ) {

    }

}
