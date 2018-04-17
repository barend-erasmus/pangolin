import { AppendEntriesResponse } from '../models/append-entries-response';
import { State } from '../models/state';
import { VoteRequest } from '../models/vote-request';
import { VoteResponse } from '../models/vote-response';

export interface ITransportProtocol {

    sendAppendEntriesRequest(state: State): Promise<AppendEntriesResponse[]>;

    sendVoteRequest(voteRequest: VoteRequest): Promise<VoteResponse[]>;

}
