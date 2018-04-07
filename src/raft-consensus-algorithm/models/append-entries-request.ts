import { LogEntry } from './log-entry';

export class AppendEntriesRequest {

constructor(
    public leaderId: string,
    public logEntries: LogEntry[],
    public term: number,
) {

}

}
