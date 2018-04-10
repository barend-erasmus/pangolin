import { RaftConsensusAlgorithm } from '../raft-consensus-algorithm/raft-consensus-algorithm';
import { IMessageHandler } from '../web-socket-relay-server/interfaces/message-handler';
import { Message } from '../web-socket-relay-server/models/message';
import { Constants } from './constants';

export class WebSocketRelayClientMessageHandler implements IMessageHandler {

    constructor(
        protected raftConsensusAlgorithm: RaftConsensusAlgorithm,
    ) {

    }

    public async handle(message: Message): Promise<any> {
        if (message.command === Constants.WEB_SOCKET_RELAY_CLIENT_HEARTBEAT_REQUEST_COMMAND) {
            return this.raftConsensusAlgorithm.handleHeartbeatRequest(message.payload);
        } else if (message.command === Constants.WEB_SOCKET_RELAY_CLIENT_VOTE_REQUEST_COMMAND) {
            return this.raftConsensusAlgorithm.handleVoteRequest(message.payload);
        }
    }
}
