import { ConsensusAlgorithm } from './consensus-algorithm/consensus-algorithm';
import { DemoTransportProtocol } from './consensus-algorithm/demo-transport-protocol';
import { ITransportProtocol } from './consensus-algorithm/interfaces/transport-protocol';

const nodes: string[] = [
    'node-1',
    'node-2',
    'node-3',
    'node-4',
];

const transportProtocol: ITransportProtocol = new DemoTransportProtocol(nodes);

const consensusAlgorithms: ConsensusAlgorithm[] = [
    new ConsensusAlgorithm('node-1', nodes, transportProtocol),
    new ConsensusAlgorithm('node-2', nodes, transportProtocol),
    new ConsensusAlgorithm('node-3', nodes, transportProtocol),
    new ConsensusAlgorithm('node-4', nodes, transportProtocol),
];

setInterval(() => {
    consensusAlgorithms[0].tick();
}, Math.random() * 3000);

setInterval(() => {
    consensusAlgorithms[1].tick();
}, Math.random() * 3000);

setInterval(() => {
    consensusAlgorithms[2].tick();
}, Math.random() * 3000);

setInterval(() => {
    consensusAlgorithms[3].tick();
}, Math.random() * 3000);
