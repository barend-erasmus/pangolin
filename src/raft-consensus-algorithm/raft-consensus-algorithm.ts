import { ILogEntryHandler } from './interfaces/log-entry-handler';
import { ITransportProtocol } from './interfaces/transport-protocol';
import { AppendEntriesRequest } from './models/append-entries-request';
import { AppendEntriesResponse } from './models/append-entries-response';
import { State } from './models/state';
import { VoteRequest } from './models/vote-request';
import { VoteResponse } from './models/vote-response';

export class RaftConsensusAlgorithm {

    protected state: State = null;

    constructor(
        protected logEntryHandler: ILogEntryHandler,
        protected transportProtocol: ITransportProtocol,
    ) {
        this.state = new State();
    }

    public appendEntries(appendEntriesRequest: AppendEntriesRequest): AppendEntriesResponse {
        // Step down before handling RPC if need be.
        if (appendEntriesRequest.term > this.state.term) {
            this.state.defaultMatchIndex = -1;
            this.state.defaultNextIndex = this.state.log.length;
            this.state.matchIndex = {};
            this.state.nextIndex = {};
            this.state.state = 'follower';
            this.state.term = appendEntriesRequest.term;
            this.state.votedFor = null;
        }

        if (appendEntriesRequest.term < this.state.term) {
            return new AppendEntriesResponse(null, null, false, this.state.term);
        }

        // TODO: Reset election timeout

        if (appendEntriesRequest.previousLogIndex >= this.state.log.length) {
            return new AppendEntriesResponse(this.state.log.length, null, false, this.state.term);
        }

        const previousLogTerm: number = this.state.log[appendEntriesRequest.previousLogIndex].term;

        if (appendEntriesRequest.previousLogTerm >= 0 && previousLogTerm !== appendEntriesRequest.previousLogTerm) {
            let firstOfTermIndex: number = appendEntriesRequest.previousLogTerm;

            for (let i = appendEntriesRequest.previousLogTerm; i >= 0; i++) {
                if (this.state.log[i].term !== previousLogTerm) {
                    break;
                }

                firstOfTermIndex = i;
            }

            return new AppendEntriesResponse(firstOfTermIndex, previousLogTerm, false, this.state.term);
        }

        // for i from 0 to length(entries) {
        //     index = prevLogIndex + i + 1
        //     if index >= length(log) or log[index].term != entries[i].term {
        //         log = log[:index] ++ entries[i:]
        //         break
        //     }
        // }

        // // TODO: persist Raft state

        // if leaderCommit > commitIndex {
        //     commitIndex = length(log) - 1
        //     if commitIndex > leaderCommit {
        //         commitIndex = leaderCommit
        //     }
        // }

        // if commitIndex > lastApplied {
        //     for i from lastApplied+1 to commitIndex (inclusive) {
        //         stateMachine(log[i].command)
        //         lastApplied = i
        //     }
        // }

        // return (currentTerm, -1, -1, true)

        return new AppendEntriesResponse(null, null, true, this.state.term);
    }

    public async electionTimeout(id: string): Promise<void> {
        if (this.state.state === 'leader') {
            return;
        }

        this.state.term += 1;

        const electionTerm: number = this.state.term;

        this.state.votedFor = null;

        this.state.state = 'candidate';

        let numberOfVotes: number = 0;

        const voteRequest: VoteRequest = new VoteRequest(id, this.state.log.length - 1, this.state.log.length === 0 ? -1 : this.state.log[this.state.log.length - 1].term, this.state.term);

        const voteRequestResponses: VoteResponse[] = await this.transportProtocol.sendVoteRequest(voteRequest);

        for (const voteRequestResponse of voteRequestResponses) {
            if (voteRequestResponse.term > this.state.term) {
                this.state.defaultMatchIndex = -1;
                this.state.defaultNextIndex = this.state.log.length;
                this.state.matchIndex = {};
                this.state.nextIndex = {};
                this.state.state = 'follower';
                this.state.term = voteRequestResponse.term;
                this.state.votedFor = null;
            }

            if (voteRequestResponse.granted) {
                numberOfVotes += 1;
            }
        }

        if (this.state.term !== electionTerm) {
            return;
        }

        if (numberOfVotes <= voteRequestResponses.length / 2) {
            this.state.state = 'follower';
            return;
        }

        this.state.state = 'leader';

        this.state.defaultMatchIndex = -1;
        this.state.defaultNextIndex = this.state.log.length;
        this.state.matchIndex = {};
        this.state.nextIndex = {};

        // TODO: Reset election timeout

        // TODO: Send AppendEntries
    }

    public requestVote(voteRequest: VoteRequest): VoteResponse {
        // Step down before handling RPC if need be.
        if (voteRequest.term > this.state.term) {
            this.state.defaultNextIndex = this.state.log.length;
            this.state.matchIndex = -1;
            this.state.nextIndex = {};
            this.state.state = 'follower';
            this.state.term = voteRequest.term;
            this.state.votedFor = null;
        }

        // Don't vote for out-of-date candidates
        if (voteRequest.term < this.state.term) {
            return new VoteResponse(false, this.state.term);
        }

        // Don't double vote
        if (this.state.votedFor && this.state.votedFor !== voteRequest.candidateId) {
            return new VoteResponse(false, this.state.term);
        }

        // Check how up-to-date our log is
        const lastLogIndex: number = this.state.log.length - 1;

        let lastLogTerm: number = -1;

        if (this.state.log.length !== 0) {
            lastLogTerm = this.state.log[lastLogIndex].term;
        }

        // Reject leaders with old logs
        if (voteRequest.lastLogTerm === lastLogTerm && voteRequest.lastLogIndex < lastLogIndex) {
            return new VoteResponse(false, this.state.term);
        }

        this.state.votedFor = voteRequest.candidateId;

        // TODO: Reset election timeout

        return new VoteResponse(true, this.state.term);
    }

}
