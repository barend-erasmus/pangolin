import { MessageQueueClient } from './message-queue-client';

(async () => {
    const messageQueueClient1: MessageQueueClient = new MessageQueueClient('ws://events.openservices.co.za', async (channel: string, data: any, messageQueueClient: MessageQueueClient) => {
        console.log(data);
    },
        [
            'channel-1',
        ]);

    const messageQueueClient2: MessageQueueClient = new MessageQueueClient('ws://events.openservices.co.za', async (channel: string, data: any, messageQueueClient: MessageQueueClient) => {
        messageQueueClient.send('channel-1', 'PONG from Client 2');
    },
        [
            'channel-2',
        ]);

    await messageQueueClient1.connect();
    await messageQueueClient2.connect();

    messageQueueClient1.send('channel-2', 'PING from Client 1');
})();
