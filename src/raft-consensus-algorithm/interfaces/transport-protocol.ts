import { AppendEntriesRequest } from '../models/append-entries-request';
import { AppendEntriesResponse } from '../models/append-entries-response';
import { VoteRequest } from '../models/vote-request';
import { VoteResponse } from '../models/vote-response';

export interface ITransportProtocol {

    sendAppendEntriesRequest(appendEntriesRequest: AppendEntriesRequest, id: string): Promise<AppendEntriesResponse>;

    sendVoteRequest(voteRequest: VoteRequest): Promise<VoteResponse[]>;

}
