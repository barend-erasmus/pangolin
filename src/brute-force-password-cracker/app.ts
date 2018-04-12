import { BruteForcePasswordCrackerAgent } from './agent';

(async () => {
    const bruteForcePasswordCrackerAgent: BruteForcePasswordCrackerAgent = new BruteForcePasswordCrackerAgent('ws://localhost:5001');
    await bruteForcePasswordCrackerAgent.connect();
})();
