import { InMemoryTransportProtocol } from './raft-consensus-algorithm/in-memory-transport-protocol';
import { ITransportProtocol } from './raft-consensus-algorithm/interfaces/transport-protocol';
import { RaftConsensusAlgorithm } from './raft-consensus-algorithm/raft-consensus-algorithm';

const raftConsensusAlgorithm1 = new RaftConsensusAlgorithm(null);
const raftConsensusAlgorithm2 = new RaftConsensusAlgorithm(null);
const raftConsensusAlgorithm3 = new RaftConsensusAlgorithm(null);

const transportProtocol: ITransportProtocol = new InMemoryTransportProtocol([
    raftConsensusAlgorithm1,
    raftConsensusAlgorithm2,
    raftConsensusAlgorithm3,
]);

raftConsensusAlgorithm1.setTransportProtocol(transportProtocol);
raftConsensusAlgorithm2.setTransportProtocol(transportProtocol);
raftConsensusAlgorithm3.setTransportProtocol(transportProtocol);

setInterval(() => {
    raftConsensusAlgorithm1.tick();
    raftConsensusAlgorithm2.tick();
    raftConsensusAlgorithm3.tick();
}, 1000);
