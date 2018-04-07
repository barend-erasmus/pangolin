import { LogEntry } from './log-entry';

export class State {

    constructor(
        public currentTerm: number,
        public isCandidate: boolean,
        public isFollower: boolean,
        public isLeader: boolean,
        public logEntries: LogEntry[],
        public votedFor: string,
    ) {

    }

    public lastLogEntryIndex(): number {
        return this.logEntries.length === 0 ? 0 : this.logEntries[this.logEntries.length - 1].index;
    }
}
