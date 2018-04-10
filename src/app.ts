import { DistributedBrowserAgent } from './distributed-browser/distributed-browser-agent';
import { WebSocketRelayServer } from './web-socket-relay-server/web-socket-relay-server';

(async () => {
    const webSocketRelayServer: WebSocketRelayServer = new WebSocketRelayServer(5001);

    webSocketRelayServer.listen();

    const agent1: DistributedBrowserAgent = new DistributedBrowserAgent('ws://127.0.0.1:5001');
    const agent2: DistributedBrowserAgent = new DistributedBrowserAgent('ws://127.0.0.1:5001');
    const agent3: DistributedBrowserAgent = new DistributedBrowserAgent('ws://127.0.0.1:5001');
    const agent4: DistributedBrowserAgent = new DistributedBrowserAgent('ws://127.0.0.1:5001');
    const agent5: DistributedBrowserAgent = new DistributedBrowserAgent('ws://127.0.0.1:5001');
    const agent6: DistributedBrowserAgent = new DistributedBrowserAgent('ws://127.0.0.1:5001');

    await agent1.connect();
    console.log('agent 1 connected');

    await agent2.connect();
    console.log('agent 2 connected');

    await agent3.connect();
    console.log('agent 3 connected');

    await agent4.connect();
    console.log('agent 4 connected');

    await agent5.connect();
    console.log('agent 5 connected');

    await agent6.connect();
    console.log('agent 6 connected');

    setTimeout(() => {
        agent1.close();
        agent2.close();
        agent3.close();
        agent4.close();
        agent5.close();
        agent6.close();
        webSocketRelayServer.close();
    }, 100000);
})();
