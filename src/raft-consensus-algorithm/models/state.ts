import { LogEntry } from './log-entry';

export class State {

    public commitIndex: number = null;

    public defaultMatchIndex: number = null;

    public defaultNextIndex: number = null;

    public lastApplied: number = null;

    public log: LogEntry[] = [];

    public matchIndex: {} = null;

    public nextIndex: {} = null;

    public state: string = null;

    public term: number = null;

    public votedFor: string = null;

    constructor() {
        this.defaultMatchIndex = -1;
        this.defaultNextIndex = 0;
        this.commitIndex = -1;
        this.lastApplied = -1;
        this.state = 'follower';
        this.term = 0;
    }

}
