import { expect } from 'chai';
import 'mocha';
import { Message as RPCMessage } from './../remote-procedure-call/models/message';
import { Message } from './models/message';
import { WebSocketRelayClient } from './web-socket-relay-client';
import { WebSocketRelayServer } from './web-socket-relay-server';

describe('WebSocketRelayServer', () => {

    let webSocketRelayClient1: WebSocketRelayClient = null;
    let webSocketRelayClient2: WebSocketRelayClient = null;
    let webSocketRelayServer: WebSocketRelayServer = null;

    afterEach(() => {
        webSocketRelayClient1.close();
        webSocketRelayClient2.close();
        webSocketRelayServer.close();
    });

    beforeEach(async () => {
        webSocketRelayClient1 = new WebSocketRelayClient('ws://127.0.0.1:5001', {
            handle: async (message: Message) => {
                if (message.payload === 'PING') {
                    return 'PONG';
                }

                return 'ERROR';
            },
        });

        webSocketRelayClient2 = new WebSocketRelayClient('ws://127.0.0.1:5001', {
            handle: async (message: Message) => {
                if (message.payload === 'PING') {
                    return 'PONG';
                }

                return 'ERROR';
            },
        });

        webSocketRelayServer = new WebSocketRelayServer(5001);

        webSocketRelayServer.listen();
        await webSocketRelayClient1.connect();
        await webSocketRelayClient2.connect();

        await webSocketRelayClient1.handshake();
        await webSocketRelayClient2.handshake();

        await webSocketRelayClient1.refreshConnections();
        await webSocketRelayClient2.refreshConnections();
    });

    describe('Ping Pong', () => {

        it('should receive PONG', async () => {
            const response: RPCMessage = await webSocketRelayClient1.send(new Message('command', null, webSocketRelayClient1.connection.id, 'PING', webSocketRelayClient1.connections[0].id));

            expect(response.payload).to.be.eq('PONG');
        });

    });

});
