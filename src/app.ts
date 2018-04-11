import { BruteForcePasswordCrackerAgent } from './brute-force-password-cracker/agent';
import { WebSocketRelayServer } from './web-socket-relay-server/web-socket-relay-server';

(async () => {
    const webSocketRelayServer: WebSocketRelayServer = new WebSocketRelayServer(5001);
    webSocketRelayServer.listen();

    const agent1: BruteForcePasswordCrackerAgent = new BruteForcePasswordCrackerAgent('ws://127.0.0.1:5001');
    await agent1.connect();

    const agent2: BruteForcePasswordCrackerAgent = new BruteForcePasswordCrackerAgent('ws://127.0.0.1:5001');
    await agent2.connect();

    const agent3: BruteForcePasswordCrackerAgent = new BruteForcePasswordCrackerAgent('ws://127.0.0.1:5001');
    await agent3.connect();

    const agent4: BruteForcePasswordCrackerAgent = new BruteForcePasswordCrackerAgent('ws://127.0.0.1:5001');
    await agent4.connect();
})();
