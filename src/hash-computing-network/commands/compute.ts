import { HashTaskRange } from '../hash-task-range';

export class ComputeCommand {

    public type: string = 'compute';

    constructor(
        public hashTaskRange: HashTaskRange,
        public masterId: string,
    ) {

    }

}
