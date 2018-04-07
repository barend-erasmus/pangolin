import { LogEntry } from './log-entry';

export class State {

    constructor(
        public commitIndex: number,
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

    public setAsCandidate(): void {
        this.commitIndex = this.lastLogEntryIndex();
        this.isCandidate = true;
        this.isFollower = false;
        this.isLeader = false;
    }

    public setAsFollower(): void {
        this.commitIndex = this.lastLogEntryIndex();
        this.isCandidate = false;
        this.isFollower = true;
        this.isLeader = false;
    }

}
