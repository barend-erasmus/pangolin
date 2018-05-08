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

function sendHashTaskRange(hashTaskRange: HashTaskRange, workerProcess: string): void {
    masterClient.send(new PublishCommand(`hash-computing-network-slave-${workerProcess}`, new ComputeCommand(hashTaskRange, masterId)));
}

function onHashTaskSolved(answer: string, result: string): void {
    console.log(`Solved '${result}': '${answer}'`);
}

function onMessage(command: Command, client: Client): void {
    const publishCommand: PublishCommand = command as PublishCommand;

    if (publishCommand.data.type === 'compute-result') {
        const computeResultCommand: ComputeResultCommand = new ComputeResultCommand(
            new HashTaskRange(publishCommand.data.hashTaskRange.end, publishCommand.data.hashTaskRange.result, publishCommand.data.hashTaskRange.start),
            publishCommand.data.answer,
        );

        masterNode.addCompletedHashTaskRange(computeResultCommand.hashTaskRange, computeResultCommand.answer);
    }

    if (publishCommand.data.type === 'join') {
        const joinCommand: JoinCommand = new JoinCommand(publishCommand.data.slaveId);

        const addWorkerProcessResult: boolean = masterNode.addWorkerProcess(joinCommand.slaveId);

        if (addWorkerProcessResult) {
            console.log(`'${joinCommand.slaveId}' joined`);
        }
    }
}

const masterId: string = uuid.v4();

const masterNode: Node = new Node(onHashTaskSolved, sendHashTaskRange);

const masterClient: Client = new Client('ws://pangolin.message-queue.openservices.co.za', onMessage,
    [
        `hash-computing-network-master-${masterId}`,
    ]);

masterClient.connect();

setInterval(() => {
    masterClient.send(new PublishCommand('hash-computing-network', new PingCommand(masterId)));
    masterNode.tick();
}, 7000);
