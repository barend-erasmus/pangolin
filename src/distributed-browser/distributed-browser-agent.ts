import { LamportTimestamp } from '../lamport-timestamp/lamport-timestamp';
import { ITransportProtocol } from '../raft-consensus-algorithm/interfaces/transport-protocol';
import { RaftConsensusAlgorithm } from '../raft-consensus-algorithm/raft-consensus-algorithm';
import { IMessageHandler } from '../web-socket-relay-server/interfaces/message-handler';
import { Message } from '../web-socket-relay-server/models/message';
import { WebSocketRelayClient } from '../web-socket-relay-server/web-socket-relay-client';
import { Constants } from './constants';
import { DataStore } from './data-store';
import { DataStoreEntry } from './models/data-store-entry';
import { WebSocketRelayClientMessageHandler } from './web-socket-relay-client-message-handler';
import { WebSocketRelayClientTransportProtocol } from './web-socket-relay-client-transport-protocol';

export class DistributedBrowserAgent {

    protected agentTickInterval: NodeJS.Timer = null;

    protected dataStore: DataStore = null;

    protected lamportTimestamp: LamportTimestamp = null;

    protected raftConsensusAlgorithm: RaftConsensusAlgorithm = null;

    protected messageHandler: WebSocketRelayClientMessageHandler = null;

    protected refreshConnectionsInterval: NodeJS.Timer = null;

    protected tickInterval: NodeJS.Timer = null;

    protected transportProtocol: ITransportProtocol = null;

    protected webSocketRelayClient: WebSocketRelayClient = null;

    constructor(protected host: string) {
        this.dataStore = new DataStore();

        this.lamportTimestamp = new LamportTimestamp();

        this.raftConsensusAlgorithm = new RaftConsensusAlgorithm(null);

        this.messageHandler = new WebSocketRelayClientMessageHandler(this.dataStore, this.lamportTimestamp, this.raftConsensusAlgorithm, null);

        this.webSocketRelayClient = new WebSocketRelayClient(this.host, this.messageHandler);

        this.messageHandler.setWebSocketRelayClient(this.webSocketRelayClient);

        this.transportProtocol = new WebSocketRelayClientTransportProtocol(this.webSocketRelayClient);

        this.raftConsensusAlgorithm.setTransportProtocol(this.transportProtocol);
    }

    public close(): void {
        clearInterval(this.agentTickInterval);
        clearInterval(this.refreshConnectionsInterval);
        clearInterval(this.tickInterval);

        this.webSocketRelayClient.close();
    }

    public async connect(): Promise<void> {
        await this.webSocketRelayClient.connect();
        await this.webSocketRelayClient.handshake();

        this.setIntervals();
    }

    protected async agentTick(): Promise<void> {
        if (this.raftConsensusAlgorithm.isLeader()) {
            const lastDataStoreEntry: DataStoreEntry = this.dataStore.getLast();

            if (!lastDataStoreEntry || lastDataStoreEntry.id !== this.webSocketRelayClient.connection.id) {
                const dataStoreEntry: DataStoreEntry = new DataStoreEntry(this.webSocketRelayClient.connection.id, this.dataStore.getNextIndex(), this.lamportTimestamp.increment());
                const result: boolean = this.dataStore.insert(dataStoreEntry);

                for (const connection of this.webSocketRelayClient.connections) {
                    await this.webSocketRelayClient.send(new Message(Constants.WEB_SOCKET_RELAY_CLIENT_INSERT_DATA_STORE_ENTRY_COMMAND, null, this.webSocketRelayClient.connection.id, dataStoreEntry, connection.id));
                }
            }
        } else if (this.dataStore.get().length === 0) {
            const response: Message = await this.webSocketRelayClient.send(new Message(Constants.WEB_SOCKET_RELAY_CLIENT_DATA_STORE_ENTRIES_COMMAND, null, this.webSocketRelayClient.connection.id, null, this.raftConsensusAlgorithm.getLeader()));
            this.dataStore.set(response.payload);
        }
    }

    protected setIntervals(): void {
        this.agentTickInterval = setInterval(() => {
            this.agentTick();
        }, 5000);

        this.refreshConnectionsInterval = setInterval(() => {
            this.webSocketRelayClient.refreshConnections();
        }, 3000);

        this.tickInterval = setInterval(() => {
            this.raftConsensusAlgorithm.tick();
        }, 2000);
    }

}
