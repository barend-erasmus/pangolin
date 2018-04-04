import * as uuid from 'uuid';
import { HashProcessEventDataStore } from './data-stores/hash-process-event';
import { HashProcessEvent } from './events/hash-process';
import { HashProcessCompletedEvent } from './events/hash-process-completed';
import { HashProcessCreatedEvent } from './events/hash-process-created';
import { ConsoleLogger } from './logger/console';
import { HashProcess } from './models/hash-process';
import { Message } from './models/message';
import { RaftRPCClient } from './raft-rpc-client';
import { RPCClient } from './rpc-client';

export class HashProcessClient {

    protected hashProcessEventDataStore: HashProcessEventDataStore = null;

    constructor(
        protected consoleLogger: ConsoleLogger,
        protected raftRPCClient: RaftRPCClient,
        protected rpcClient: RPCClient,
    ) {
        this.hashProcessEventDataStore = new HashProcessEventDataStore(this.consoleLogger);

        this.hashProcessEventDataStore.appendHashProcessEvent(new HashProcessCreatedEvent('fC', 'D077F244DEF8A70E5EA758BD8352FCD8', this.hashProcessEventDataStore.getLastHashProcessEventIndex() + 1, 'a'));

        this.rpcClient.addOnMessageFn((message: Message) => this.onMessage(message));

        this.rpcClient.addOnOpenFn(() => this.onOpen());

        setInterval(() => {
            this.onCycle();
        }, 5000);
    }

    protected getHashProcess(): HashProcess {
        let hashProcess: HashProcess = this.hashProcessEventDataStore.findExpiredHashProcess();

        if (!hashProcess) {
            hashProcess = this.hashProcessEventDataStore.findUnprocessedHashProcess();

            if (!hashProcess) {
                hashProcess = this.hashProcessEventDataStore.nextHashProcess();

                if (!hashProcess) {
                    return null;
                }

                const hashProcessCreatedEvent: HashProcessEvent = new HashProcessCreatedEvent(hashProcess.endValue, hashProcess.hash, this.hashProcessEventDataStore.getLastHashProcessEventIndex() + 1, hashProcess.startValue);
                const result: boolean = this.hashProcessEventDataStore.appendHashProcessEvent(hashProcessCreatedEvent);

                if (result) {
                    for (const client of this.rpcClient.getClients()) {
                        this.sendAppendHashProcessEvents(client, hashProcessCreatedEvent);
                    }
                }
            }
        }

        return hashProcess;
    }

    protected getRPCClientIdFromRaftClientId(raftClientId: string): string {
        const rpcClient: { id: string, metadata: any } = this.rpcClient.findClientByMetadata('raft-client-id', raftClientId);

        return rpcClient ? rpcClient.id : null;
    }

    protected handleAppendHashProcessEvents(message: Message): void {
        const lastHashProcessEventIndex: number = this.hashProcessEventDataStore.getLastHashProcessEventIndex();

        if (!this.raftRPCClient.isLeader() && !this.isMessageFromLeader(message)) {
            this.rpcClient.send('error', message.correlationId, { leader: this.raftRPCClient.getLeader(), message: `Follower can only receive messages from the leader` }, message.from);
            return;
        }

        for (const item of message.data) {
            const result: boolean = this.hashProcessEventDataStore.appendHashProcessEvent(item);
        }

        this.rpcClient.send(message.command, message.correlationId, { lastHashProcessEventIndex }, message.from);
    }

    protected isMessageFromLeader(message: Message): boolean {
        const leaderRPCClientId: string = this.getRPCClientIdFromRaftClientId(this.raftRPCClient.getLeader());

        if (leaderRPCClientId !== message.from) {
            return false;
        }

        return true;
    }

    protected onCycle(): void {
        if (this.raftRPCClient.isLeader()) {
            for (const client of this.rpcClient.getClients()) {
                const hashProcess: HashProcess = this.getHashProcess();

                if (hashProcess) {
                    this.rpcClient.send('find-hash', null, hashProcess, client.id).then((message: Message) => {
                        const hashProcessCompletedEvent: HashProcessCompletedEvent = new HashProcessCompletedEvent(hashProcess.endValue, hashProcess.hash, this.hashProcessEventDataStore.getLastHashProcessEventIndex() + 1, message.data.result, null);
                        const result: boolean = this.hashProcessEventDataStore.appendHashProcessEvent(hashProcessCompletedEvent);

                        for (const clientForHashProcessEvent of this.rpcClient.getClients()) {
                            this.sendAppendHashProcessEvents(clientForHashProcessEvent, hashProcessCompletedEvent);
                        }
                    });
                }
            }
        }
    }

    protected onMessage(message: Message): void {
        switch (message.command) {
            case 'hash-process-event-data-store-append-hash-process-events':
                this.handleAppendHashProcessEvents(message);
                break;
        }
    }

    protected onOpen(): void {
        this.rpcClient.send('set-metadata', null, { key: 'raft-client-id', value: this.raftRPCClient.getId() }, 'server');
    }

    protected sendAppendHashProcessEvents(client: { id: string, metadata: any }, hashProcessEvent: HashProcessEvent): void {
        this.rpcClient.send('hash-process-event-data-store-append-hash-process-events', null, [hashProcessEvent], client.id).then((message: Message) => {
            if (message.data.lastHashProcessEventIndex !== this.hashProcessEventDataStore.getLastHashProcessEventIndex()) {
                this.rpcClient.send('hash-process-event-data-store-append-hash-process-events', null, this.hashProcessEventDataStore.getLastHashProcessEventsFromIndex(message.data), client.id);
            }
        });
    }
}
