import { expect } from 'chai';
import 'mocha';
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
        rpcClient = new RPCClient('127.0.0.1', {
            handle: async (message: Message) => {
                if (message.payload === 'PING') {
                    return 'PONG';
                }

                return 'ERROR';
            },
        }, 5001);

        rpcServer = new RPCServer({
            handle: async (message: Message) => {
                if (message.payload === 'PING') {
                    return 'PONG';
                }

                return 'ERROR';
            },
        }, 5001);

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
