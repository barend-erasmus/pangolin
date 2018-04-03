import * as uuid from 'uuid';
import { HashProcessEventDataStore } from './data-stores/hash-process-event';
import { HashProcessEvent } from './events/hash-process';
import { HashProcessCreatedEvent } from './events/hash-process-created';
import { HashProcess } from './models/hash-process';
import { Message } from './models/message';
import { RaftRPCClient } from './raft-rpc-client';
import { RPCClient } from './rpc-client';

export class HashProcessClient {

    protected hashProcessEventDataStore: HashProcessEventDataStore = new HashProcessEventDataStore();

    constructor(
        private raftRPCClient: RaftRPCClient,
        private rpcClient: RPCClient,
    ) {
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
                    for (const client of this.rpcClient.clients) {
                        this.sendAppendHashProcessEvents(client, hashProcessCreatedEvent);
                    }
                }
            }
        }
    }

    protected getRPCClientIdFromRaftClientId(raftClientId: string): string {
        const rpcClient: { id: string, metadata: any } = this.rpcClient.clients.find((client) => client.metadata['raft-client-id'] === raftClientId);

        return rpcClient ? rpcClient.id : null;
    }

    protected handleAppendHashProcessEvents(message: Message): void {
        const lastHashProcessEventIndex: number = this.hashProcessEventDataStore.getLastHashProcessEventIndex();

        if (this.raftRPCClient.isLeader() || (!this.raftRPCClient.isLeader() && this.isMessageFromLeader(message))) {
            for (const item of message.data) {
                const result: boolean = this.hashProcessEventDataStore.appendHashProcessEvent(item);
            }

            this.rpcClient.send(message.command, message.correlationId, { lastHashProcessEventIndex, message: null }, message.from);
        } else {
            this.rpcClient.send(message.command, message.correlationId, { lastHashProcessEventIndex, message: `leader: ${this.raftRPCClient.leader}` }, message.from);
        }
    }

    protected isMessageFromLeader(message: Message): boolean {
        const leaderRPCClientId: string = this.getRPCClientIdFromRaftClientId(this.raftRPCClient.leader);

        if (leaderRPCClientId !== message.from) {
            return false;
        }

        return true;
    }

    protected onCycle(): void {
        if (this.raftRPCClient.isLeader()) {
            const hashProcess: HashProcess = this.getHashProcess();

            if (hashProcess) {
                // TODO:
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
        this.rpcClient.send('set-metadata', null, { key: 'raft-client-id', value: this.raftRPCClient.id }, 'server');
    }

    protected sendAppendHashProcessEvents(client: { id: string, metadata: any }, hashProcessEvent: HashProcessEvent): void {
        this.rpcClient.send('hash-process-event-data-store-append-hash-process-events', null, [hashProcessEvent], client.id).then((message: Message) => {
            if (message.data.lastHashProcessEventIndex !== this.hashProcessEventDataStore.getLastHashProcessEventIndex()) {
                this.rpcClient.send('hash-process-event-data-store-append-hash-process-events', null, this.hashProcessEventDataStore.getLastHashProcessEventsFromIndex(message.data), client.id);
            }
        });
    }
}
