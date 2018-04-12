import * as BigNumber from 'big-number';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { AlphaNumericCounter } from '../alpha-numeric-counter/alpha-numeric-counter';
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

        this.dataStore.insertLogEntry(new LogEntry('root', new Hash([], 'BDAE8A558D1998938A59F498A62DD906'.toLowerCase()), 'hash', this.vectorClock.increment()));

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
                if (hash.solved()) {
                    continue;
                }

                const expiredHashAttempt: HashAttempt = hash.getExpiredAttempt();

                if (expiredHashAttempt) {
                    expiredHashAttempt.lastProcessedTimestamp = new Date().getTime();

                    const logEntry: LogEntry = new LogEntry(`${this.id}-${uuid.v4()}`, expiredHashAttempt, 'hash-attempt', this.vectorClock.increment());
                    this.sendLogEntryToAll(logEntry);

                    this.processHashAttempt(expiredHashAttempt);

                    break;
                }

                if (hash.attempts.length === 0) {
                    const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(BigNumber(0));

                    const start: string = alphaNumericCounter.get().toString();
                    alphaNumericCounter.increment(BigNumber(1999));
                    const end: string = alphaNumericCounter.get().toString();

                    const hashAttempt: HashAttempt = new HashAttempt(end, hash.value, new Date().getTime(), false, null, start);

                    const logEntry: LogEntry = new LogEntry(`${this.id}-${uuid.v4()}`, hashAttempt, 'hash-attempt', this.vectorClock.increment());
                    this.sendLogEntryToAll(logEntry);

                    this.processHashAttempt(hashAttempt);

                    break;
                } else {
                    const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(BigNumber(hash.findMaximumEnd()));
                    alphaNumericCounter.increment(BigNumber(1));

                    const start: string = alphaNumericCounter.get().toString();
                    alphaNumericCounter.increment(BigNumber(1999));
                    const end: string = alphaNumericCounter.get().toString();

                    const hashAttempt: HashAttempt = new HashAttempt(end, hash.value, new Date().getTime(), false, null, start);

                    const logEntry: LogEntry = new LogEntry(`${this.id}-${uuid.v4()}`, hashAttempt, 'hash-attempt', this.vectorClock.increment());
                    this.sendLogEntryToAll(logEntry);

                    this.processHashAttempt(hashAttempt);

                    break;
                }
            }
        }, (Math.random() * 10000) + 3000);
    }

    protected processHashAttempt(hashAttempt: HashAttempt): void {
        const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(BigNumber(hashAttempt.start));

        while (alphaNumericCounter.get().lte(hashAttempt.end)) {
            const str: string = alphaNumericCounter.toString();

            const result: string = crypto.createHash('md5').update(str).digest('hex');

            if (result === hashAttempt.hashValue) {
                console.log(`SOLVED - ${str} -> ${hashAttempt.hashValue}`);
                hashAttempt.lastProcessedTimestamp = null;
                hashAttempt.processed = true;
                hashAttempt.result = str;

                const solvedLogEntry: LogEntry = new LogEntry(`${this.id}-${uuid.v4()}`, hashAttempt, 'hash-attempt', this.vectorClock.increment());
                this.sendLogEntryToAll(solvedLogEntry);

                break;
            }

            alphaNumericCounter.increment(BigNumber(1));
        }

        if (!hashAttempt.result) {
            hashAttempt.lastProcessedTimestamp = null;
            hashAttempt.processed = true;

            const unsolvedLogEntry: LogEntry = new LogEntry(`${this.id}-${uuid.v4()}`, hashAttempt, 'hash-attempt', this.vectorClock.increment());
            this.sendLogEntryToAll(unsolvedLogEntry);
        }
    }

    protected async sendLogEntryToAll(logEntry: LogEntry): Promise<void> {
        const from: string = this.webSocketRelayClient.connection.id;

        for (const connection of this.webSocketRelayClient.connections) {
            this.webSocketRelayClient.send(new Message('insert-log-entry', null, from, logEntry, connection.id));
        }

        this.dataStore.insertLogEntry(logEntry);
    }

}
