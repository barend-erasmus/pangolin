import { ITransportProtocol } from '../raft-consensus-algorithm/interfaces/transport-protocol';
import { HeartbeatRequest } from '../raft-consensus-algorithm/models/heartbeat-request';
import { HeartbeatResponse } from '../raft-consensus-algorithm/models/heartbeat-response';
import { State } from '../raft-consensus-algorithm/models/state';
import { VoteRequest } from '../raft-consensus-algorithm/models/vote-request';
import { VoteResponse } from '../raft-consensus-algorithm/models/vote-response';
import { Message } from '../web-socket-relay-server/models/message';
import { WebSocketRelayClient } from '../web-socket-relay-server/web-socket-relay-client';
import { Constants } from './constants';

export class WebSocketRelayClientTransportProtocol implements ITransportProtocol {

    constructor(protected webSocketRelayClient: WebSocketRelayClient) {

    }

    public async sendHeartbeatRequest(state: State): Promise<HeartbeatResponse[]> {
        const heartbeatRequest: HeartbeatRequest = new HeartbeatRequest(state.term);

        return this.sendToAll<HeartbeatResponse>(Constants.WEB_SOCKET_RELAY_CLIENT_HEARTBEAT_REQUEST_COMMAND, heartbeatRequest);
    }

    public async sendVoteRequest(state: State): Promise<VoteResponse[]> {
        const voteRequest: VoteRequest = new VoteRequest(this.webSocketRelayClient.connection.id, state.term);

        return this.sendToAll<VoteResponse>(Constants.WEB_SOCKET_RELAY_CLIENT_VOTE_REQUEST_COMMAND, voteRequest);
    }

    protected async sendToAll<T>(command: string, payload: any): Promise<T[]> {
        const requests: Array<Promise<Message>> = [];

        for (const connection of this.webSocketRelayClient.connections) {
            const from: string = this.webSocketRelayClient.connection.id;
            const to: string = connection.id;

            requests.push(this.webSocketRelayClient.send(new Message(command, null, from, payload, to)));
        }

        const responses: Message[] = await Promise.all(requests);

        return responses.map((response: Message) => response.payload);
    }

}
