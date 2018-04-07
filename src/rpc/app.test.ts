import { expect } from 'chai';
import 'mocha';
import { Logger } from './logger';
import { Message } from './models/message';
import { RPCClient } from './rpc-client';
import { RPCServer } from './rpc-server';

describe('RPC', () => {

    let rpcClient: RPCClient = null;
    let rpcServer: RPCServer = null;

    afterEach(() => {
        rpcClient.close();
        rpcServer.close();
    });

    beforeEach(async () => {
        const logger: Logger = new Logger();

        rpcClient = new RPCClient('127.0.0.1', logger, 5001);

        rpcServer = new RPCServer(logger, 5001);
        rpcServer.setOnMessageAction((message: Message) => {
            if (message.payload ===  'PING') {
                return 'PONG';
            }

            return 'ERROR';
        });

        rpcServer.listen();
        await rpcClient.connect();
    });

    describe('Ping Pong', () => {

        it('should receive PONG', async () => {
            const response: Message = await rpcClient.send(new Message('command', null, 'PING'));

            expect(response.payload).to.be.eq('PONG');
        });

    });

});
