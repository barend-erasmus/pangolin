# Remote Procedure Call (RPC)

"In distributed computing, a remote procedure call (RPC) is when a computer program causes a procedure (subroutine) to execute in a different address space (commonly on another computer on a shared network), which is coded as if it were a normal (local) procedure call, without the programmer explicitly coding the details for the remote interaction." ~ [Wikipedia](https://en.wikipedia.org/wiki/Remote_procedure_call)


![](https://github.com/barend-erasmus/pangolin/raw/master/images/remote-procedure-call.png)

## Usage Example

```typescript
const rpcClient = new RPCClient('127.0.0.1', {
    handle: async (message: Message) => {
        if (message.payload === 'PING') {
            return 'PONG';
        }

        return 'ERROR';
    },
}, 5001);

const rpcServer = new RPCServer({
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