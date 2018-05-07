import * as uuid from 'uuid';
import { ComputeCommand } from './hash-computing-network/commands/compute';
import { ComputeResultCommand } from './hash-computing-network/commands/compute-result';
import { JoinCommand } from './hash-computing-network/commands/join';
import { PingCommand } from './hash-computing-network/commands/ping';
import { HashTaskRange } from './hash-computing-network/hash-task-range';
import { Node } from './hash-computing-network/node';
import { Client } from './message-queue/client';
import { Command } from './message-queue/commands/command';
import { PublishCommand } from './message-queue/commands/publish';

function sendHashTaskRange(hashTaskRange: HashTaskRange, workerProcess: string): void {
    masterClient.send(new PublishCommand(`hash-computing-network-slave-${workerProcess}`, new ComputeCommand(hashTaskRange, `hash-computing-network-master-${masterId}`)));
}

async function onMessage(command: Command, client: Client): Promise<void> {
    const publishCommand: PublishCommand = command as PublishCommand;

    console.log(`Master: '${publishCommand.data.type}'`);

    if (publishCommand.data.type === 'compute-result') {
        const computeResultCommand: ComputeResultCommand = new ComputeResultCommand(
            new HashTaskRange(publishCommand.data.hashTaskRange.end, publishCommand.data.hashTaskRange.result, publishCommand.data.hashTaskRange.start),
            publishCommand.data.answer,
        );

        node.addCompletedHashTaskRange(computeResultCommand.hashTaskRange, computeResultCommand.answer);
    }

    if (publishCommand.data.type === 'join') {
        const joinCommand: JoinCommand = new JoinCommand(publishCommand.data.slaveId);

        node.addWorkerProcess(joinCommand.slaveId);
    }
}

const masterId: string = uuid.v4();

const node: Node = new Node(sendHashTaskRange);

const masterClient: Client = new Client('ws://events.openservices.co.za', onMessage,
    [
        `hash-computing-network-master-${masterId}`,
    ]);

masterClient.connect();

setInterval(() => {
    masterClient.send(new PublishCommand('hash-computing-network', new PingCommand(masterId)));
    node.tick();
}, 20000);

const slaveId: string = uuid.v4();

const slaveClient: Client = new Client('ws://events.openservices.co.za', async (command: Command, client: Client): Promise<void> => {
    const publishCommand: PublishCommand = command as PublishCommand;

    console.log(`Slave: '${publishCommand.data.type}'`);

    if (publishCommand.data.type === 'ping') {
        const pingCommand: PingCommand = new PingCommand(publishCommand.data.masterId);

        client.send(new PublishCommand(`hash-computing-network-master-${pingCommand.masterId}`, new JoinCommand(slaveId)));
    }
},
    [
        `hash-computing-network`,
        `hash-computing-network-slave-${slaveId}`,
    ]);

slaveClient.connect();
