import { ILogEntryHandler } from './interfaces/log-entry-handler';
import { ITransportProtocol } from './interfaces/transport-protocol';
import { AppendEntriesRequest } from './models/append-entries-request';
import { AppendEntriesResponse } from './models/append-entries-response';
import { LogEntry } from './models/log-entry';
import { State } from './models/state';
import { VoteRequest } from './models/vote-request';
import { VoteResponse } from './models/vote-response';

export class RaftConsensusAlgorithm {

    public electionTimeout: number = null;

    protected state: State = null;

    constructor(
        protected logEntryHandler: ILogEntryHandler,
        protected transportProtocol: ITransportProtocol,
    ) {
        this.resetElectionTimeout();

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

        this.resetElectionTimeout();

        if (appendEntriesRequest.previousLogIndex >= this.state.log.length) {
            return new AppendEntriesResponse(this.state.log.length, null, false, this.state.term);
        }

        const previousLogTerm: number = this.state.log.length === 0 ? -1 : this.state.log[appendEntriesRequest.previousLogIndex].term;

        if (appendEntriesRequest.previousLogIndex >= 0 && previousLogTerm !== appendEntriesRequest.previousLogTerm) {
            let firstOfTermIndex: number = appendEntriesRequest.previousLogIndex;

            for (const i of this.range(appendEntriesRequest.previousLogIndex, 0)) {
                if (this.state.log[i].term !== previousLogTerm) {
                    break;
                }

                firstOfTermIndex = i;
            }

            return new AppendEntriesResponse(firstOfTermIndex, previousLogTerm, false, this.state.term);
        }

        for (const i of this.range(0, appendEntriesRequest.logEntries.length)) {
            const index: number = appendEntriesRequest.previousLogIndex + i + 1;

            if (index >= this.state.log.length || this.state.log[index].term !== appendEntriesRequest.logEntries[index].term) {
                // TODO: log = log[:index] ++ entries[i:]
                break;
            }
        }

        if (appendEntriesRequest.leaderCommitIndex > this.state.commitIndex) {
            this.state.commitIndex = this.state.log.length - 1;
            if (this.state.commitIndex > appendEntriesRequest.leaderCommitIndex) {
                this.state.commitIndex = appendEntriesRequest.leaderCommitIndex;
            }
        }

        if (this.state.commitIndex > this.state.lastApplied) {
            for (const i of this.range(this.state.lastApplied + 1, this.state.commitIndex)) {
                this.logEntryHandler.handle(this.state.log[i]);
                this.state.lastApplied = i;
            }
        }

        return new AppendEntriesResponse(null, null, true, this.state.term);
    }

    public isLeader(): boolean {
        return this.state.state === 'leader';
    }

    public async onElectionTimeout(id: string, peerIds: string[]): Promise<void> {
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

        this.resetElectionTimeout();

        await this.onHeartbeatTimeout(id, peerIds);
    }

    public async onHeartbeatTimeout(id: string, peerIds: string[]): Promise<void> {
        if (this.state.state !== 'leader') {
            return;
        }

        for (const peerId of peerIds) {
            if (!this.state.nextIndex[peerId]) {
                this.state.nextIndex[peerId] = this.state.defaultNextIndex;
            }

            if (this.state.nextIndex[peerId] > this.state.log.length) {
                this.state.nextIndex[peerId] = this.state.log.length;
            }

            const logEntries: LogEntry[] = []; // TODO: log[nextIndex[peer]:]

            const previousLogIndex: number = this.state.nextIndex[peerId] - 1;
            let previousLogTerm: number = -1;

            if (previousLogIndex >= 0) {
                previousLogTerm = this.state.log[previousLogIndex].term;
            }

            const sendTerm: number = this.state.term;

            const appendEntriesRequest: AppendEntriesRequest = new AppendEntriesRequest(this.state.commitIndex, id, logEntries, previousLogIndex, previousLogTerm, sendTerm);
            const appendEntriesRequestResponse: AppendEntriesResponse = await this.transportProtocol.sendAppendEntriesRequest(appendEntriesRequest, peerId);

            if (appendEntriesRequestResponse.term > this.state.term) {
                this.state.defaultMatchIndex = -1;
                this.state.defaultNextIndex = this.state.log.length;
                this.state.matchIndex = {};
                this.state.nextIndex = {};
                this.state.state = 'follower';
                this.state.term = appendEntriesRequest.term;
                this.state.votedFor = null;
            }

            if (this.state.term !== sendTerm) {
                continue;
            }

            if (appendEntriesRequestResponse.success) {
                this.state.nextIndex[peerId] = appendEntriesRequestResponse.conflictIndex;

                if (appendEntriesRequestResponse.conflictIndex !== -1) {
                    let lastInConflictTerm: number = -1;

                    for (const i of this.range(previousLogIndex, 0)) {
                        const term: number = this.state.log.length === 0 ? -1 : this.state.log[i].term;

                        if (term === appendEntriesRequestResponse.conflictTerm) {
                            lastInConflictTerm = i;
                            break;
                        } else if (term < appendEntriesRequestResponse.conflictTerm) {
                            break;
                        }
                    }

                    if (lastInConflictTerm !== -1) {
                        this.state.nextIndex[peerId] = lastInConflictTerm + 1;
                    }
                }

                // TODO: Resend append entries
                continue;
            }

            if (!this.state.matchIndex[peerId]) {
                this.state.matchIndex[peerId] = this.state.defaultMatchIndex;
            }

            this.state.matchIndex[peerId] = previousLogIndex + this.state.log.length;
            this.state.nextIndex[peerId] = this.state.matchIndex[peerId] + 1;

            for (const n of this.range(this.state.log.length, this.state.commitIndex)) {
                if (this.state.log[n].term !== this.state.term) {
                    break;
                }

                let replicas: number = 0;

                for (const peerIdX of peerIds) {
                    if (this.state.matchIndex[peerIdX] >= n) {
                        replicas += 1;
                    }
                }

                if (replicas > peerIds.length / 2) {
                    this.state.commitIndex = n;
                    break;
                }
            }
        }
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

        this.resetElectionTimeout();

        return new VoteResponse(true, this.state.term);
    }

    public setTransportProtocol(transportProtocol: ITransportProtocol): void {
        this.transportProtocol = transportProtocol;
    }

    public async tick(id: string, peerIds: string[]): Promise<void> {
        if (this.state.state === 'leader') {
            this.onHeartbeatTimeout(id, peerIds);
            return;
        }

        if (new Date().getTime() < this.electionTimeout) {
            return;
        }

        this.onElectionTimeout(id, peerIds);
    }

    protected range(from: number, to: number): number[] {
        const result: number[] = [];

        if (from < to) {
            for (let i = from; i <= to; i++) {
                result.push(i);
            }
        }

        if (from > to) {
            for (let i = from; i >= to; i--) {
                result.push(i);
            }
        }

        if (from === to) {
            result.push(from);
        }

        return result;
    }

    protected resetElectionTimeout(): void {
        this.electionTimeout = new Date().getTime() + ((Math.random() * 3000) + 2000);
    }

}
