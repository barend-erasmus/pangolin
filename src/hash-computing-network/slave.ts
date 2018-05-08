import * as uuid from 'uuid';
import { Client } from '../message-queue/client';
import { Command } from '../message-queue/commands/command';
import { PublishCommand } from '../message-queue/commands/publish';
import { ComputeCommand } from './commands/compute';
import { ComputeResultCommand } from './commands/compute-result';
import { JoinCommand } from './commands/join';
import { PingCommand } from './commands/ping';
import { HashTaskRange } from './hash-task-range';
import { Node } from './node';

const slaveId: string = uuid.v4();

const slaveNode: Node = new Node(null, null);

const slaveClient: Client = new Client('ws://pangolin.message-queue.openservices.co.za', async (command: Command, client: Client): Promise<void> => {
    const publishCommand: PublishCommand = command as PublishCommand;

    if (publishCommand.data.type === 'compute') {
        const computeCommand: ComputeCommand = new ComputeCommand(
            new HashTaskRange(publishCommand.data.hashTaskRange.end, publishCommand.data.hashTaskRange.result, publishCommand.data.hashTaskRange.start),
            publishCommand.data.masterId,
        );

        const answer: string = slaveNode.computeHashTaskRange(computeCommand.hashTaskRange);

        const computeResultCommand: ComputeResultCommand = new ComputeResultCommand(computeCommand.hashTaskRange, answer);

        client.send(new PublishCommand(`hash-computing-network-master-${computeCommand.masterId}`, computeResultCommand));
    }

    if (publishCommand.data.type === 'ping') {
        const pingCommand: PingCommand = new PingCommand(publishCommand.data.masterId);

        const joinCommand: JoinCommand = new JoinCommand(slaveId);

        client.send(new PublishCommand(`hash-computing-network-master-${pingCommand.masterId}`, joinCommand));
    }
},
    [
        `hash-computing-network`,
        `hash-computing-network-slave-${slaveId}`,
    ]);

slaveClient.connect();
