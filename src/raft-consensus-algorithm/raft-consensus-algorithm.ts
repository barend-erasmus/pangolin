import { AppendEntriesRequest } from './models/append-entries-request';
import { AppendEntriesResponse } from './models/append-entries-response';
import { State } from './models/state';
import { VoteRequest } from './models/vote-request';
import { VoteResponse } from './models/vote-response';

export class RaftConsensusAlgorithm {

    protected electionTimeout: number = null;

    protected sendHeartbeat: (state: State) => void = null;

    protected state: State = new State(0, false, true, false, [], null);

    public handleAppendEntriesRequest(appendEntriesRequest: AppendEntriesRequest): AppendEntriesResponse {
        if (this.state.currentTerm < appendEntriesRequest.term) {
            return new AppendEntriesResponse(this.state.currentTerm, false);
        }

        if (this.state.currentTerm > appendEntriesRequest.term) {
            this.state.currentTerm = appendEntriesRequest.term;
        }

        if (!appendEntriesRequest.logEntries || appendEntriesRequest.logEntries.length === 0) {
            return new AppendEntriesResponse(this.state.currentTerm, true);
        }

        if (this.state.lastLogEntryIndex() + 1 !==  appendEntriesRequest.logEntries[0].index) {
            return new AppendEntriesResponse(this.state.currentTerm, false);
        }
    }

    public handleVoteRequest(voteRequest: VoteRequest): VoteResponse {
        if (this.state.currentTerm < voteRequest.term) {
            return new VoteResponse(false, this.state.currentTerm);
        }

        if (this.state.currentTerm > voteRequest.term) {
            this.state.currentTerm = voteRequest.term;
        }

        if (this.state.votedFor) {
            return new VoteResponse(false, this.state.currentTerm);
        }

        this.state.votedFor = voteRequest.candidateId;

        return new VoteResponse(true, this.state.currentTerm);
    }

    public tick(): void {

    }

}
