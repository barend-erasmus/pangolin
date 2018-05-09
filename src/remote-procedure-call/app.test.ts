import { expect } from 'chai';
import 'mocha';
import { Message } from './models/message';
import { TCPRPCClient } from './tcp-rpc-client';
import { TCPRPCServer } from './tcp-rpc-server';

describe('TCPRPC', () => {

    let rpcClient: TCPRPCClient = null;
    let rpcServer: TCPRPCServer = null;

    afterEach(() => {
        rpcClient.close();
        rpcServer.close();
    });

    beforeEach(async () => {
        rpcClient = new TCPRPCClient(async (message: Message) => {
            if (message.payload === 'PING') {
                return 'PONG';
            }

            return 'ERROR';
        }, '127.0.0.1', 5001);

        rpcServer = new TCPRPCServer(async (message: Message) => {
                if (message.payload === 'PING') {
                    return 'PONG';
                }

                return 'ERROR';
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
