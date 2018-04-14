import { BruteForcePasswordCrackerAgent } from './agent';

export let bruteForcePasswordCrackerAgent: BruteForcePasswordCrackerAgent = null;

(async () => {
    bruteForcePasswordCrackerAgent = new BruteForcePasswordCrackerAgent('ws://138.68.188.8:5001');
    await bruteForcePasswordCrackerAgent.connect();
})();
