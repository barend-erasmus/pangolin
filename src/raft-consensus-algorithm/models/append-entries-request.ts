import { LogEntry } from './log-entry';

export class AppendEntriesRequest {

    constructor(
        public leaderCommitIndex: number,
        public leaderId: string,
        public logEntries: LogEntry[],
        public previousLogIndex: number,
        public previousLogTerm: number,
        public term: number,
    ) {

    }

}
