import { HeartbeatResponse } from '../models/heartbeat-response';
import { State } from '../models/state';
import { VoteResponse } from '../models/vote-response';

export interface ITransportProtocol {

    sendHeartbeatRequest(state: State): Promise<HeartbeatResponse[]>;

    sendVoteRequest(state: State): Promise<VoteResponse[]>;

}
