import { ITransportProtocol } from './interfaces/transport-protocol';
import { HeartbeatRequest } from './models/heartbeat-request';
import { HeartbeatResponse } from './models/heartbeat-response';
import { State } from './models/state';
import { VoteRequest } from './models/vote-request';
import { VoteResponse } from './models/vote-response';
import { RaftConsensusAlgorithm } from './raft-consensus-algorithm';

export class InMemoryTransportProtocol implements ITransportProtocol {

    constructor(protected raftConsensusAlgorithms: RaftConsensusAlgorithm[]) {

    }

    public async sendHeartbeatRequest(state: State): Promise<HeartbeatResponse[]> {
        const heartbeatRequest: HeartbeatRequest = new HeartbeatRequest(state.term);

        return this.raftConsensusAlgorithms.map((raftConsensusAlgorithm: RaftConsensusAlgorithm) => raftConsensusAlgorithm.handleHeartbeatRequest(heartbeatRequest));
    }

    public async sendVoteRequest(state: State): Promise<VoteResponse[]> {
        const voteRequest: VoteRequest = new VoteRequest('node', state.term);

        return this.raftConsensusAlgorithms.map((raftConsensusAlgorithm: RaftConsensusAlgorithm) => raftConsensusAlgorithm.handleVoteRequest(voteRequest));
    }

}
