import * as fs from 'fs';
import * as uuid from 'uuid';
import { VectorClock } from '../vector-clock/vector-clock';
import { Message } from '../web-socket-relay-server/models/message';
import { WebSocketRelayClient } from '../web-socket-relay-server/web-socket-relay-client';
import { DataStore } from './data-store';
import { Hash } from './models/hash';
import { HashAttempt } from './models/hash-attempt';
import { LogEntry } from './models/log-entry';
import { WebSocketRelayClientMessageHandler } from './web-socket-relay-client-message-handler';

export class BruteForcePasswordCrackerAgent {

    protected dataStore: DataStore = null;

    protected id: string = null;

    protected messageHandler: WebSocketRelayClientMessageHandler = null;

    protected vectorClock: VectorClock = null;

    protected webSocketRelayClient: WebSocketRelayClient = null;

    constructor(
        protected host: string,
    ) {
        this.vectorClock = new VectorClock(uuid.v4());

        this.dataStore = new DataStore(this.vectorClock);

        this.id = uuid.v4();

        this.messageHandler = new WebSocketRelayClientMessageHandler(this.dataStore);

        this.webSocketRelayClient = new WebSocketRelayClient(this.host, this.messageHandler);

        this.messageHandler.setWebSocketRelayClient(this.webSocketRelayClient);
    }

    public async connect(): Promise<void> {
        await this.webSocketRelayClient.connect();
        await this.webSocketRelayClient.handshake();

        setInterval(() => {
            this.webSocketRelayClient.refreshConnections();
        }, 2000);

        setInterval(() => {
            const hashes: Hash[] = this.dataStore.getHashes();

            for (const hash of hashes) {
                const expiredHashAttempt: HashAttempt = hash.getExpiredAttempt();

                if (expiredHashAttempt) {
                    expiredHashAttempt.lastProcessedTimestamp = new Date().getTime();

                    const logEntry: LogEntry = new LogEntry(`${this.id}-${uuid.v4()}`, expiredHashAttempt, 'hash-attempt', this.vectorClock.increment());
                    this.sendLogEntryToAll(logEntry);
                    break;
                }

                if (!hash.solved()) {
                    console.log('aa');
                    // TODO
                    break;
                }
            }
        }, (Math.random() * 10000) + 3000);
    }

    protected async sendLogEntryToAll(logEntry: LogEntry): Promise<void> {
        const from: string = this.webSocketRelayClient.connection.id;

        for (const connection of this.webSocketRelayClient.connections) {
            this.webSocketRelayClient.send(new Message('insert-log-entry', null, from, logEntry, connection.id));
        }
    }

}
