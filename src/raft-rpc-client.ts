import * as uuid from 'uuid';
import { RaftClientTickAction } from './enums/raft-client-tick-action';
import { Message } from './models/message';
import { RaftClient } from './raft-client';
import { RPCClient } from './rpc-client';

export class RaftRPCClient extends RaftClient {

    constructor(
        private rpcClient: RPCClient,
    ) {
        super(uuid.v4());

        this.rpcClient.addOnMessageFn((message: Message) => this.onMessage(message));

        this.rpcClient.addOnOpenFn(() => this.onOpen());

        setInterval(() => {
            this.onCycle();
        }, 1000);
    }

    private handleHeartbeat(message: Message): void {
        this.heartbeat(message.data.id, message.data.term);

        this.rpcClient.send(message.command, message.correlationId, `OK`, message.from);
    }

    private handleRequestVote(message: Message): void {
        if (this.vote(message.data.id, message.data.term)) {
            this.rpcClient.send(message.command, message.correlationId, message.data, message.from);
        } else {
            this.rpcClient.send(message.command, message.correlationId, null, message.from);
        }
    }

    private onCycle(): void {
        if (this.rpcClient.clients.length < 3) {
            return;
        }

        const raftClientTickAction: RaftClientTickAction = this.tick();

        if (raftClientTickAction === RaftClientTickAction.NONE) {

        } else if (raftClientTickAction === RaftClientTickAction.REQUEST_VOTES) {
            for (const client of this.rpcClient.clients) {
                if (client.id === this.rpcClient.id) {
                    continue;
                }

                this.rpcClient.send('raft-client-request-vote', null, { id: this.id, term: this.term }, client.id).then((message: Message) => {
                    if (message.data) {
                        this.receiveVote(message.data.term);
                    }
                });
            }
        } else if (raftClientTickAction === RaftClientTickAction.SEND_HEARTBEAT) {
            for (const client of this.rpcClient.clients) {
                if (client.id === this.rpcClient.id) {
                    continue;
                }

                this.rpcClient.send('raft-client-heartbeat', null, { id: this.id, term: this.term }, client.id);
            }
        }
    }

    private onMessage(message: Message): void {
        switch (message.command) {
            case 'raft-client-heartbeat':
                this.handleHeartbeat(message);
                break;
            case 'raft-client-request-vote':
                this.handleRequestVote(message);
                break;
        }
    }

    private onOpen(): void {
        this.rpcClient.send('set-metadata', null, { key: 'raft-client-id', value: this.id }, 'server');
    }
}
