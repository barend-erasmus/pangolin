import * as uuid from 'uuid';
import { RaftClientTickAction } from './enums/raft-client-tick-action';
import { ConsoleLogger } from './logger/console';
import { Message } from './models/message';
import { RaftClient } from './raft-client';
import { RPCClient } from './rpc-client';

export class RaftRPCClient extends RaftClient {

    constructor(
        protected consoleLogger: ConsoleLogger,
        protected rpcClient: RPCClient,
    ) {
        super(consoleLogger, uuid.v4());

        this.rpcClient.addOnMessageFn((message: Message) => this.onMessage(message));

        this.rpcClient.addOnOpenFn(() => this.onOpen());

        setInterval(() => {
            this.onCycle();
        }, 1000);
    }

    protected handleHeartbeat(message: Message): void {
        this.heartbeat(message.data.id, message.data.term);

        this.rpcClient.send(message.command, message.correlationId, `OK`, message.from);
    }

    protected handleRequestVote(message: Message): void {
        if (this.vote(message.data.id, message.data.term)) {
            this.rpcClient.send(message.command, message.correlationId, message.data, message.from);
        } else {
            this.rpcClient.send(message.command, message.correlationId, null, message.from);
        }
    }

    protected onCycle(): void {
        if (this.rpcClient.getNumberOfClients() < 3) {
            return;
        }

        this.setNumberOfNodes(this.rpcClient.getNumberOfClients());

        const raftClientTickAction: RaftClientTickAction = this.tick();

        if (raftClientTickAction === RaftClientTickAction.NONE) {

        } else if (raftClientTickAction === RaftClientTickAction.REQUEST_VOTES) {
            for (const client of this.rpcClient.getClients()) {
                if (client.id === this.rpcClient.getId()) {
                    continue;
                }

                this.rpcClient.send('raft-client-request-vote', null, { id: this.id, term: this.term }, client.id).then((message: Message) => {
                    if (message.data) {
                        this.receiveVote(message.data.term);
                    }
                });
            }
        } else if (raftClientTickAction === RaftClientTickAction.SEND_HEARTBEAT) {
            for (const client of this.rpcClient.getClients()) {
                if (client.id === this.rpcClient.getId()) {
                    continue;
                }

                this.rpcClient.send('raft-client-heartbeat', null, { id: this.id, term: this.term }, client.id);
            }
        }
    }

    protected onMessage(message: Message): void {
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
