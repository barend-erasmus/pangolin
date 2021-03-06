# Web Socket Relay Server

## Usage Example

```typescript
const webSocketRelayClient1: WebSocketRelayClient = new WebSocketRelayClient('ws://127.0.0.1:5001', {
            handle: async (message: Message) => {
                if (message.payload === 'PING') {
                    return 'PONG';
                }

                return 'ERROR';
            },
        });

const webSocketRelayClient2: WebSocketRelayClient = new WebSocketRelayClient('ws://127.0.0.1:5001', {
            handle: async (message: Message) => {
                if (message.payload === 'PING') {
                    return 'PONG';
                }

                return 'ERROR';
            },
        });

const webSocketRelayServer: WebSocketRelayServer =  new WebSocketRelayServer(5001);

webSocketRelayServer.listen();
await webSocketRelayClient1.connect();
await webSocketRelayClient2.connect();

await webSocketRelayClient1.handshake();
await webSocketRelayClient2.handshake();

await webSocketRelayClient1.refreshConnections();
await webSocketRelayClient2.refreshConnections();

const response: RPCMessage = await webSocketRelayClient1.send(new Message('command', null, webSocketRelayClient1.connection.id, 'PING', webSocketRelayClient1.connections[0].id));
```