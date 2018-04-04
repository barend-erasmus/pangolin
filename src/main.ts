import * as crypto from 'crypto';
import { AlphaNumericCounter } from './alpha-numeric-counter';
import { HashProcessClient } from './hash-process-client';
import { ConsoleLogger } from './logger/console';
import { HashProcess } from './models/hash-process';
import { Message } from './models/message';
import { RaftRPCClient } from './raft-rpc-client';
import { RPCClient } from './rpc-client';

const consoleLogger: ConsoleLogger = new ConsoleLogger();

const rpcClient: RPCClient = new RPCClient(consoleLogger, [], [], 'ws://localhost:8891');

const raftRPCClient: RaftRPCClient = new RaftRPCClient(consoleLogger, rpcClient);

const hashProcessClient: HashProcessClient = new HashProcessClient(consoleLogger, raftRPCClient, rpcClient);

rpcClient.addOnMessageFn((message: Message) => {
    if (message.command === 'find-hash') {
        const hashProcess: HashProcess = message.data;

        const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(hashProcess.startValue);

        let found: boolean = false;

        while (true) {
            const str: string = alphaNumericCounter.value;

            const hash: string = crypto.createHash('md5').update(str).digest('hex');

            if (hash.toLowerCase() === hashProcess.hash.toLowerCase()) {
                hashProcess.completed = true;
                hashProcess.inProgress = false;
                hashProcess.result = str;

                rpcClient.send(message.command, message.correlationId, {
                    result: str,
                }, message.from);

                found = true;

                consoleLogger.info(`FOUND: '${hash}' -> '${str}'`);
            }

            if (str === hashProcess.endValue) {
                break;
            }

            alphaNumericCounter.incrementBy(1);
        }

        if (!found) {
            hashProcess.completed = true;
            hashProcess.inProgress = false;
            hashProcess.result = null;

            rpcClient.send(message.command, message.correlationId, {
                result: null,
            }, message.from);
        }
    }
});
