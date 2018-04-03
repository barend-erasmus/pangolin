import * as uuid from 'uuid';
import { RaftClientTickAction } from './enums/raft-client-tick-action';
import { Message } from './models/message';
import { RaftClient } from './raft-client';
import { RPCClient } from './rpc-client';

const raftClient: RaftClient = new RaftClient(uuid.v4());

let rpcClient: RPCClient = null;

rpcClient = new RPCClient((message: Message) => {
    if (message.command === 'raft-client-request-vote') {
        rpcClient.send(message.command, message.correlationId, `OK`, message.from);

        if (raftClient.vote(message.data.id, message.data.term)) {
            rpcClient.send('raft-client-vote', null, message.data, message.from);
        }
    } else if (message.command === 'raft-client-vote') {
        raftClient.receiveVote(message.data.term);

        rpcClient.send(message.command, message.correlationId, `OK`, message.from);
    } else if (message.command === 'raft-client-heartbeat') {
        raftClient.heartbeat(message.data.id, message.data.term);

        rpcClient.send(message.command, message.correlationId, `OK`, message.from);
    }
}, 'ws://localhost:8891');

setInterval(() => {

    if (rpcClient.clientIds.length < 3) {
        return;
    }

    const raftClientTickAction: RaftClientTickAction = raftClient.tick();

    if (raftClientTickAction === RaftClientTickAction.NONE) {

    } else if (raftClientTickAction === RaftClientTickAction.REQUEST_VOTES) {
        const requests: Array<Promise<any>> = [];

        for (const clientId of rpcClient.clientIds) {
            if (clientId === rpcClient.id) {
                continue;
            }

            rpcClient.send('raft-client-request-vote', null, { id: raftClient.id, term: raftClient.term }, clientId);
        }
    } else if (raftClientTickAction === RaftClientTickAction.SEND_HEARTBEAT) {
        for (const clientId of rpcClient.clientIds) {
            if (clientId === rpcClient.id) {
                continue;
            }

            rpcClient.send('raft-client-heartbeat', null, { id: raftClient.id, term: raftClient.term }, clientId);
        }
    }
}, 1000);
