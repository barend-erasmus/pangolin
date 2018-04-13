import { BruteForcePasswordCrackerAgent } from './agent';

export let bruteForcePasswordCrackerAgent: BruteForcePasswordCrackerAgent = null;

(async () => {
    bruteForcePasswordCrackerAgent = new BruteForcePasswordCrackerAgent('ws://localhost:5001');
    await bruteForcePasswordCrackerAgent.connect();
})();
