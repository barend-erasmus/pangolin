import { LamportTimestamp } from '../lamport-timestamp/lamport-timestamp';
import { RaftConsensusAlgorithm } from '../raft-consensus-algorithm/raft-consensus-algorithm';
import { IMessageHandler } from '../web-socket-relay-server/interfaces/message-handler';
import { Message } from '../web-socket-relay-server/models/message';
import { WebSocketRelayClient } from '../web-socket-relay-server/web-socket-relay-client';
import { Constants } from './constants';
import { DataStore } from './data-store';

export class WebSocketRelayClientMessageHandler implements IMessageHandler {

    constructor(
        protected dataStore: DataStore,
        protected lamportTimestamp: LamportTimestamp,
        protected raftConsensusAlgorithm: RaftConsensusAlgorithm,
        protected webSocketRelayClient: WebSocketRelayClient,
    ) {

    }

    public async handle(message: Message): Promise<any> {
        if (message.command === Constants.WEB_SOCKET_RELAY_CLIENT_DATA_STORE_ENTRIES_COMMAND) {
            console.log(message.command);
            return this.dataStore.get();
        } else if (message.command === Constants.WEB_SOCKET_RELAY_CLIENT_HEARTBEAT_REQUEST_COMMAND) {
            return this.raftConsensusAlgorithm.handleHeartbeatRequest(message.payload);
        } else if (message.command === Constants.WEB_SOCKET_RELAY_CLIENT_INSERT_DATA_STORE_ENTRY_COMMAND) {
            const result: boolean = this.dataStore.insert(message.payload);

            if (!result) {
                const response: Message = await this.webSocketRelayClient.send(new Message(Constants.WEB_SOCKET_RELAY_CLIENT_DATA_STORE_ENTRIES_COMMAND, null, this.webSocketRelayClient.connection.id, null, this.raftConsensusAlgorithm.getLeader()));
                this.dataStore.set(response.payload);
            }

            return 'OK';
        } else if (message.command === Constants.WEB_SOCKET_RELAY_CLIENT_VOTE_REQUEST_COMMAND) {
            return this.raftConsensusAlgorithm.handleVoteRequest(message.payload);
        }
    }

    public setWebSocketRelayClient(webSocketRelayClient: WebSocketRelayClient): void {
        this.webSocketRelayClient = webSocketRelayClient;
    }
}
