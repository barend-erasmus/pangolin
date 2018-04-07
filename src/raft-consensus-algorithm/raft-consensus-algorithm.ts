import { AppendEntriesRequest } from './models/append-entries-request';
import { AppendEntriesResponse } from './models/append-entries-response';
import { LogEntry } from './models/log-entry';
import { State } from './models/state';
import { VoteRequest } from './models/vote-request';
import { VoteResponse } from './models/vote-response';

export class RaftConsensusAlgorithm {

    protected electionTimeout: number = null;

    protected sendHeartbeat: (logEntries: LogEntry[], state: State) => Promise<boolean> = null;

    protected state: State = new State(0, 0, false, true, false, [], null);

    public handleAppendEntriesRequest(appendEntriesRequest: AppendEntriesRequest): AppendEntriesResponse {
        if (this.state.currentTerm < appendEntriesRequest.term) {
            return new AppendEntriesResponse(this.state.currentTerm, false);
        }

        if (this.state.currentTerm > appendEntriesRequest.term) {
            this.state.currentTerm = appendEntriesRequest.term;
            this.state.setAsFollower();
        }

        if (!appendEntriesRequest.logEntries || appendEntriesRequest.logEntries.length === 0) {
            return new AppendEntriesResponse(this.state.currentTerm, true);
        }

        if (this.state.lastLogEntryIndex() + 1 !==  appendEntriesRequest.logEntries[0].index) {
            return new AppendEntriesResponse(this.state.currentTerm, false);
        }

        this.state.logEntries = this.state.logEntries.concat(appendEntriesRequest.logEntries);
    }

    public handleVoteRequest(voteRequest: VoteRequest): VoteResponse {
        if (this.state.currentTerm < voteRequest.term) {
            return new VoteResponse(false, this.state.currentTerm);
        }

        if (this.state.currentTerm > voteRequest.term) {
            this.state.currentTerm = voteRequest.term;
            this.state.votedFor = null;
        }

        if (this.state.votedFor) {
            return new VoteResponse(false, this.state.currentTerm);
        }

        this.state.votedFor = voteRequest.candidateId;

        return new VoteResponse(true, this.state.currentTerm);
    }

    public tick(): void {
        if (this.state.isCandidate) {

        } else if (this.state.isFollower) {

        } else if (this.state.isLeader) {
            this.tickLeader();
        }
    }

    protected hasExceededElectionTime(): boolean {
        return new Date().getTime() > this.electionTimeout;
    }

    protected resetElectionTimeout(): void {
        this.electionTimeout = new Date().getTime() + Math.floor(Math.random() * 9000) + 1000;
    }

    protected tickFollower(): void {
        if (this.hasExceededElectionTime()) {

        }
    }

    protected tickLeader(): void {

    }

}
