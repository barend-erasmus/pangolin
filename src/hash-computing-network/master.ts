import * as uuid from 'uuid';
import { MessageQueueClient } from '../message-queue/message-queue-client';
import { ComputeCommand } from './commands/compute';
import { ComputeResultCommand } from './commands/compute-result';
import { JoinCommand } from './commands/join';
import { PingCommand } from './commands/ping';
import { HashTaskRange } from './hash-task-range';
import { MasterNode } from './master-node';

export class Master {

    protected id: string = null;

    protected masterNode: MasterNode = null;

    protected messageQueueClient: MessageQueueClient = null;

    constructor() {
        this.id = uuid.v4();

        this.masterNode = new MasterNode(5000, 10000, this.onHashTaskSolved, this.sendHashRangeTask, 20000);

        this.messageQueueClient = new MessageQueueClient('ws://pangolin.message-queue.openservices.co.za', this.onMessage,
            [
                `hash-computing-network-master-${this.id}`,
            ]);
    }

    public async start(): Promise<void> {
        await this.messageQueueClient.connect();

        setInterval(() => {
            this.messageQueueClient.send('hash-computing-network', new PingCommand(this.id));
            this.masterNode.tick();
        }, 7000);
    }

    protected sendHashRangeTask(hashTaskRange: HashTaskRange, workerProcess: string): void {
        this.messageQueueClient.send(`hash-computing-network-slave-${workerProcess}`, new ComputeCommand(hashTaskRange, this.id));
    }

    protected onHashTaskSolved(answer: string, result: string): void {
        console.log(`Solved '${result}': '${answer}'`);
    }

    protected onMessage(channel: string, data: any, messageQueueClient: MessageQueueClient): void {
        if (data.type === 'compute-result') {
            const computeResultCommand: ComputeResultCommand = new ComputeResultCommand(
                new HashTaskRange(data.hashTaskRange.end, data.hashTaskRange.result, data.hashTaskRange.start),
                data.answer,
            );

            this.masterNode.addCompletedHashTaskRange(computeResultCommand.hashTaskRange, computeResultCommand.answer);
        }

        if (data.type === 'join') {
            const joinCommand: JoinCommand = new JoinCommand(data.slaveId);

            const addWorkerProcessResult: boolean = this.masterNode.addWorkerProcess(joinCommand.slaveId);
        }
    }

}

const master: Master = new Master();

master.start();
