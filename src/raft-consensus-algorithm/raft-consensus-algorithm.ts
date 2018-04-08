import { AppendEntriesRequest } from './models/append-entries-request';
import { AppendEntriesResponse } from './models/append-entries-response';
import { LogEntry } from './models/log-entry';
import { State } from './models/state';
import { VoteRequest } from './models/vote-request';
import { VoteResponse } from './models/vote-response';

export class RaftConsensusAlgorithm {

    protected electionTimeout: number = null;

    protected onSendAppendEntriesRequest: (logEntries: LogEntry[], state: State) => Promise<AppendEntriesResponse[]> = null;

    protected onSendVoteRequest: (state: State) => Promise<VoteResponse[]> = null;

    protected state: State = new State(0, false, true, false, [], null);

    public handleAppendEntriesRequest(appendEntriesRequest: AppendEntriesRequest): AppendEntriesResponse {
        if (this.state.term < appendEntriesRequest.term) {
            return new AppendEntriesResponse(this.state.term, false);
        }

        this.resetElectionTimeout();

        if (this.state.term > appendEntriesRequest.term) {
            this.state.term = appendEntriesRequest.term;
            this.state.setAsFollower();
        }

        // if (!appendEntriesRequest.logEntries || appendEntriesRequest.logEntries.length === 0) {
        //     return new AppendEntriesResponse(this.state.currentTerm, true);
        // }

        // if (this.state.lastLogEntryIndex() + 1 !== appendEntriesRequest.logEntries[0].index) {
        //     return new AppendEntriesResponse(this.state.currentTerm, false);
        // }

        // this.state.logEntries = this.state.logEntries.concat(appendEntriesRequest.logEntries);

        return new AppendEntriesResponse(this.state.term, true);
    }

    public handleVoteRequest(voteRequest: VoteRequest): VoteResponse {
        if (this.state.term > voteRequest.term) {
            return new VoteResponse(false, this.state.term);
        }

        if (this.state.term < voteRequest.term) {
            this.state.term = voteRequest.term;
            this.state.votedFor = null;
        }

        if (this.state.votedFor) {
            return new VoteResponse(false, this.state.term);
        }

        this.state.votedFor = voteRequest.candidateId;

        this.resetElectionTimeout();

        return new VoteResponse(true, this.state.term);
    }

    public tick(): void {
        if (!this.electionTimeout) {
            this.resetElectionTimeout();
        }

        if (this.state.isCandidate) {

        } else if (this.state.isFollower) {
            this.tickFollower();
        } else if (this.state.isLeader) {
            this.tickLeader();
        }
    }

    public setOnSendAppendEntriesRequest(action: (logEntries: LogEntry[], state: State) => Promise<AppendEntriesResponse[]>): void {
        this.onSendAppendEntriesRequest = action;
    }

    public setOnSendVoteRequest(action: (state: State) => Promise<VoteResponse[]>): void {
        this.onSendVoteRequest = action;
    }

    protected hasExceededElectionTime(): boolean {
        return new Date().getTime() > this.electionTimeout;
    }

    protected resetElectionTimeout(): void {
        this.electionTimeout = new Date().getTime() + Math.floor(Math.random() * 9000) + 1000;
    }

    protected async tickFollower(): Promise<void> {
        if (this.hasExceededElectionTime()) {
            this.state.term++;
            this.state.setAsCandidate();

            const voteResponses: VoteResponse[] = await this.onSendVoteRequest(this.state);

            if (voteResponses.filter((voteResponse: VoteResponse) => voteResponse.granted && voteResponse.term === this.state.term).length > voteResponses.length / 2) {
                this.state.setAsLeader();
            }
        }
    }

    protected async tickLeader(): Promise<void> {
        const appendEntriesResponses: AppendEntriesResponse[] = await this.onSendAppendEntriesRequest([], this.state);
    }

}
