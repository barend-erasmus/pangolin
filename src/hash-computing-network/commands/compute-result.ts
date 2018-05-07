import { HashTaskRange } from '../hash-task-range';

export class ComputeResultCommand {

    public type: string = 'compute-result';

    constructor(
        public hashTaskRange: HashTaskRange,
        public answer: string,
    ) {

    }

}
