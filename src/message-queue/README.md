# Message Queue

## Usage Example

```typescript
const client1: Client = new Client('ws://events.openservices.co.za', async (command: Command, client: Client) => {
    console.log((command as PublishCommand).data);
},
    [
        'channel-1',
    ]);

const client2: Client = new Client('ws://events.openservices.co.za', async (command: Command, client: Client) => {
    client.send(new PublishCommand('channel-1', 'PONG from Client 2'));
},
    [
        'channel-2',
    ]);

await client1.connect();
await client2.connect();

client1.send(new PublishCommand('channel-2', 'PING'));
```