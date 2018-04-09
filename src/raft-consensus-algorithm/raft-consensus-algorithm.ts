import { ITransportProtocol } from './interfaces/transport-protocol';
import { HeartbeatRequest } from './models/heartbeat-request';
import { HeartbeatResponse } from './models/heartbeat-response';
import { State } from './models/state';
import { VoteRequest } from './models/vote-request';
import { VoteResponse } from './models/vote-response';

export class RaftConsensusAlgorithm {

    protected electionTimeout: number = null;

    protected state: State = new State(0, false, true, false, null);

    constructor(
        protected transportProtocol: ITransportProtocol,
    ) {

    }

    public handleHeartbeatRequest(heartbeatRequest: HeartbeatRequest): HeartbeatResponse {
        if (this.state.term < heartbeatRequest.term) {
            return new HeartbeatResponse(this.state.term, false);
        }

        this.resetElectionTimeout();

        if (this.state.term > heartbeatRequest.term) {
            this.state.term = heartbeatRequest.term;
            this.state.setAsFollower();
        }

        return new HeartbeatResponse(this.state.term, true);
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

    public setTransportProtocol(transportProtocol: ITransportProtocol): void {
        this.transportProtocol = transportProtocol;
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

            const voteResponses: VoteResponse[] = await this.transportProtocol.sendVoteRequest(this.state);

            if (voteResponses.filter((voteResponse: VoteResponse) => voteResponse.granted && voteResponse.term === this.state.term).length > voteResponses.length / 2) {
                this.state.setAsLeader();
            }
        }
    }

    protected async tickLeader(): Promise<void> {
        const appendEntriesResponses: HeartbeatResponse[] = await this.transportProtocol.sendHeartbeatRequest(this.state);
    }

}
