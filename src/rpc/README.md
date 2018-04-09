# Remote Procedure Call (RPC)

## Usage Example

```typescript
const logger: Logger = new Logger();

const rpcClient = new RPCClient('127.0.0.1', logger, {
    handle: async (message: Message) => {
        if (message.payload === 'PING') {
            return 'PONG';
        }

        return 'ERROR';
    },
}, 5001);

const rpcServer = new RPCServer(logger, {
    handle: async (message: Message) => {
        if (message.payload === 'PING') {
            return 'PONG';
        }

        return 'ERROR';
    },
}, 5001);

rpcServer.listen();
await rpcClient.connect();

const response: Message = await rpcClient.send(new Message('command', null, 'PING'));
```