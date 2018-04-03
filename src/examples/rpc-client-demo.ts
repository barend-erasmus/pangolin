import { Message } from '../models/message';
import { RPCClient } from '../rpc-client';

let rpcClient: RPCClient = null;

rpcClient = new RPCClient((message: Message) => {
    if (message.command === 'display') {
        rpcClient.send(message.command, message.correlationId, `OK`, message.from);
    }
}, 'ws://localhost:8891');

setTimeout(() => {
    rpcClient.send('display', null, 'hello', rpcClient.clientIds.filter((x) => x !== rpcClient.id)[Math.floor(rpcClient.clientIds.filter((x) => x !== rpcClient.id).length / 2)]).then((message) => {
        console.log(message.data);
    });
}, 10000);
