import * as uuid from 'uuid';
import { MessageQueueClient } from '../message-queue/message-queue-client';
import { ComputeCommand } from './commands/compute';
import { ComputeResultCommand } from './commands/compute-result';
import { JoinCommand } from './commands/join';
import { PingCommand } from './commands/ping';
import { HashTaskRange } from './hash-task-range';
import { SlaveNode } from './slave-node';

export class Slave {

    protected id: string = null;

    protected slaveNode: SlaveNode = null;

    protected messageQueueClient: MessageQueueClient = null;

    constructor() {
        this.id = uuid.v4();

        this.slaveNode = new SlaveNode();

        this.messageQueueClient = new MessageQueueClient('ws://pangolin.message-queue.openservices.co.za', this.onMessage,
            [
                `hash-computing-network`,
                `hash-computing-network-slave-${this.id}`,
            ]);
    }

    public async start(): Promise<void> {
        await this.messageQueueClient.connect();
    }

    protected onMessage(channel: string, data: any, messageQueueClient: MessageQueueClient): void {
        if (data.type === 'compute') {
            const computeCommand: ComputeCommand = new ComputeCommand(
                new HashTaskRange(data.hashTaskRange.end, data.hashTaskRange.result, data.hashTaskRange.start),
                data.masterId,
            );

            const answer: string = this.slaveNode.computeHashTaskRange(computeCommand.hashTaskRange);

            const computeResultCommand: ComputeResultCommand = new ComputeResultCommand(computeCommand.hashTaskRange, answer);

            this.messageQueueClient.send(`hash-computing-network-master-${computeCommand.masterId}`, computeResultCommand);
        }

        if (data.type === 'ping') {
            const pingCommand: PingCommand = new PingCommand(data.masterId);

            const joinCommand: JoinCommand = new JoinCommand(this.id);

            this.messageQueueClient.send(`hash-computing-network-master-${pingCommand.masterId}`, joinCommand);
        }
    }
}

const slave: Slave = new Slave();

slave.start();
