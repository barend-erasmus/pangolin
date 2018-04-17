import { ITransportProtocol } from './interfaces/transport-protocol';
import { AppendEntriesRequest } from './models/append-entries-request';
import { AppendEntriesResponse } from './models/append-entries-response';
import { VoteRequest } from './models/vote-request';
import { VoteResponse } from './models/vote-response';
import { RaftConsensusAlgorithm } from './raft-consensus-algorithm';

export class InMemoryTransportProtocol implements ITransportProtocol {

    constructor(protected raftConsensusAlgorithms: {}) {

    }

    public async sendAppendEntriesRequest(appendEntriesRequest: AppendEntriesRequest, id: string): Promise<AppendEntriesResponse> {
        return (this.raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).appendEntries(JSON.parse(JSON.stringify(appendEntriesRequest)));
    }

    public async sendVoteRequest(voteRequest: VoteRequest): Promise<VoteResponse[]> {
        return Object.keys(this.raftConsensusAlgorithms).map((id: string) => (this.raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).requestVote(JSON.parse(JSON.stringify(voteRequest))));
    }

}
