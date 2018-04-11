import { DistributedBrowserAgent } from './distributed-browser/distributed-browser-agent';

(async () => {
    const distributedBrowserAgent: DistributedBrowserAgent = new DistributedBrowserAgent('ws://127.0.0.1:5001');

    await distributedBrowserAgent.connect();
})();
