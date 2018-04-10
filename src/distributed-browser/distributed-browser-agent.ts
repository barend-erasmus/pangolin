import { ITransportProtocol } from '../raft-consensus-algorithm/interfaces/transport-protocol';
import { RaftConsensusAlgorithm } from '../raft-consensus-algorithm/raft-consensus-algorithm';
import { IMessageHandler } from '../web-socket-relay-server/interfaces/message-handler';
import { WebSocketRelayClient } from '../web-socket-relay-server/web-socket-relay-client';
import { WebSocketRelayClientMessageHandler } from './web-socket-relay-client-message-handler';
import { WebSocketRelayClientTransportProtocol } from './web-socket-relay-client-transport-protocol';

export class DistributedBrowserAgent {

    protected raftConsensusAlgorithm: RaftConsensusAlgorithm = null;

    protected messageHandler: IMessageHandler = null;

    protected transportProtocol: ITransportProtocol = null;

    protected webSocketRelayClient: WebSocketRelayClient = null;

    constructor(protected host: string) {
        this.raftConsensusAlgorithm = new RaftConsensusAlgorithm(null);

        this.messageHandler = new WebSocketRelayClientMessageHandler(this.raftConsensusAlgorithm);

        this.webSocketRelayClient = new WebSocketRelayClient(this.host, this.messageHandler);

        this.transportProtocol = new WebSocketRelayClientTransportProtocol(this.webSocketRelayClient);

        this.raftConsensusAlgorithm.setTransportProtocol(this.transportProtocol);
    }

    public close(): void {
        this.webSocketRelayClient.close();
    }

    public async connect(): Promise<void> {
        await this.webSocketRelayClient.connect();
        await this.webSocketRelayClient.handshake();

        this.setIntervals();
    }

    protected setIntervals(): void {
        setInterval(() => {
            this.webSocketRelayClient.refreshConnections();
        }, 3000);

        setInterval(() => {
            this.raftConsensusAlgorithm.tick();
        }, 2000);
    }

}
