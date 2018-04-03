import * as uuid from 'uuid';
import { HashProcessEventDataStore } from './data-stores/hash-process-event';
import { HashProcessEvent } from './events/hash-process';
import { HashProcessCreatedEvent } from './events/hash-process-created';
import { HashProcess } from './models/hash-process';
import { Message } from './models/message';
import { RaftRCPClient } from './raft-rpc-client';
import { RPCClient } from './rpc-client';

export class HashProcessRCPClient {

    public hashProcessEventDataStore: HashProcessEventDataStore = new HashProcessEventDataStore();

    constructor(
        private raftRCPClient: RaftRCPClient,
        private rpcClient: RPCClient,
    ) {
        this.rpcClient.addOnMessageFn((message: Message) => this.onMessage(message));

        this.rpcClient.addOnOpenFn(() => this.onOpen());

        setInterval(() => {
            this.onCycle();
        }, 5000);
    }

    private handleAppendHashProcessEvents(message: Message): void {
        const lastHashProcessEventIndex: number = this.hashProcessEventDataStore.getLastHashProcessEventIndex();

        if (!this.raftRCPClient.isLeader()) {
            const leaderRPCClient: { id: string, metadata: any } = this.rpcClient.clients.find((client) => client.metadata['raft-client-id'] === this.raftRCPClient.leader);

            if (leaderRPCClient.id !== message.from) {
                this.rpcClient.send(message.command, message.correlationId, lastHashProcessEventIndex, message.from);
            }
        }

        for (const item of message.data) {
            const result: boolean = this.hashProcessEventDataStore.appendHashProcessEvent(item);
        }

        this.rpcClient.send(message.command, message.correlationId, lastHashProcessEventIndex, message.from);
    }

    private onCycle(): void {
        if (this.raftRCPClient.isLeader()) {
            let hashProcess: HashProcess = this.hashProcessEventDataStore.findExpiredHashProcess();

            if (!hashProcess) {
                hashProcess = this.hashProcessEventDataStore.findUnprocessedHashProcess();

                if (!hashProcess) {
                    hashProcess = this.hashProcessEventDataStore.nextHashProcess();

                    if (!hashProcess) {
                        return;
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
    }

    private onMessage(message: Message): void {
        switch (message.command) {
            case 'hash-process-event-data-store-append-hash-process-events':
                this.handleAppendHashProcessEvents(message);
                break;
        }
    }

    private onOpen(): void {
        this.rpcClient.send('set-metadata', null, { key: 'raft-client-id', value: this.raftRCPClient.id }, 'server');
    }

    private sendAppendHashProcessEvents(client: { id: string, metadata: any }, hashProcessEvent: HashProcessEvent): void {
        this.rpcClient.send('hash-process-event-data-store-append-hash-process-events', null, [hashProcessEvent], client.id).then((message: Message) => {
            if (message.data !== this.hashProcessEventDataStore.getLastHashProcessEventIndex()) {
                this.rpcClient.send('hash-process-event-data-store-append-hash-process-events', null, this.hashProcessEventDataStore.hashProcessEvents.filter((x) => x.index > message.data), client.id);
            }
        });
    }
}
