import { Logger } from './rpc/logger';
import { Message } from './rpc/message';
import { RPCClient } from './rpc/rpc-client';
import { RPCServer } from './rpc/rpc-server';

(async () => {
    const logger: Logger = new Logger();

    const rpcServer1: RPCServer = new RPCServer(logger, 5001);
    rpcServer1.listen();

    const rpcServer2: RPCServer = new RPCServer(logger, 5002);
    rpcServer2.setOnMessageAction((message: Message) => {
        console.log(message.payload);

        return 'OK';
    });
    rpcServer2.listen();

    const rpcServer3: RPCServer = new RPCServer(logger, 5003);
    rpcServer3.listen();

    const rpcServer1Client1: RPCClient = new RPCClient('localhost', logger, 5002);
    await rpcServer1Client1.connect();

    const rpcServer1Client2: RPCClient = new RPCClient('localhost', logger, 5003);
    await rpcServer1Client2.connect();

    const response: Message = await rpcServer1Client1.send(new Message('show', null, 'hello world'));
    console.log(response.payload);

    rpcServer1.close();
    rpcServer2.close();
    rpcServer3.close();

    rpcServer1Client1.close();
    rpcServer1Client2.close();
})();
