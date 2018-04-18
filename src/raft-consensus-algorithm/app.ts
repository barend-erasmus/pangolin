import { InMemoryTransportProtocol } from './in-memory-transport-protocol';
import { ITransportProtocol } from './interfaces/transport-protocol';
import { LogEntry } from './models/log-entry';
import { RaftConsensusAlgorithm } from './raft-consensus-algorithm';

// import { InMemoryTransportProtocol } from './raft-consensus-algorithm/in-memory-transport-protocol';
// import { ITransportProtocol } from './raft-consensus-algorithm/interfaces/transport-protocol';
// import { LogEntry } from './raft-consensus-algorithm/models/log-entry';
// import { RaftConsensusAlgorithm } from './raft-consensus-algorithm/raft-consensus-algorithm';

const raftConsensusAlgorithm1 = new RaftConsensusAlgorithm({
    handle: async (logEntry: LogEntry): Promise<void> => {

    },
}, null);

const raftConsensusAlgorithm2 = new RaftConsensusAlgorithm({
    handle: async (logEntry: LogEntry): Promise<void> => {

    },
}, null);

const raftConsensusAlgorithm3 = new RaftConsensusAlgorithm({
    handle: async (logEntry: LogEntry): Promise<void> => {

    },
}, null);

const raftConsensusAlgorithm4 = new RaftConsensusAlgorithm({
    handle: async (logEntry: LogEntry): Promise<void> => {

    },
}, null);

const raftConsensusAlgorithm5 = new RaftConsensusAlgorithm({
    handle: async (logEntry: LogEntry): Promise<void> => {

    },
}, null);

const transportProtocol: ITransportProtocol = new InMemoryTransportProtocol({
    a: raftConsensusAlgorithm1,
    b: raftConsensusAlgorithm2,
    c: raftConsensusAlgorithm3,
    d: raftConsensusAlgorithm4,
    e: raftConsensusAlgorithm5,
});

raftConsensusAlgorithm1.setTransportProtocol(transportProtocol);
raftConsensusAlgorithm2.setTransportProtocol(transportProtocol);
raftConsensusAlgorithm3.setTransportProtocol(transportProtocol);
raftConsensusAlgorithm4.setTransportProtocol(transportProtocol);
raftConsensusAlgorithm5.setTransportProtocol(transportProtocol);

let leader: string = null;

let intervalA: NodeJS.Timer = createIntervalForRaftConsensusAlgorithm('a', raftConsensusAlgorithm1);
let intervalB: NodeJS.Timer = createIntervalForRaftConsensusAlgorithm('b', raftConsensusAlgorithm2);
let intervalC: NodeJS.Timer = createIntervalForRaftConsensusAlgorithm('c', raftConsensusAlgorithm3);
let intervalD: NodeJS.Timer = createIntervalForRaftConsensusAlgorithm('d', raftConsensusAlgorithm4);
let intervalE: NodeJS.Timer = createIntervalForRaftConsensusAlgorithm('e', raftConsensusAlgorithm5);

setInterval(() => {
    if (!leader) {
        return;
    }
    switch (leader) {
        case 'a':
            clearInterval(intervalA);
            setTimeout(() => {
                intervalA = createIntervalForRaftConsensusAlgorithm('a', raftConsensusAlgorithm1);
            }, 8000);
            break;
        case 'b':
            clearInterval(intervalB);
            setTimeout(() => {
                intervalB = createIntervalForRaftConsensusAlgorithm('b', raftConsensusAlgorithm2);
            }, 8000);
            break;
        case 'c':
            clearInterval(intervalC);
            setTimeout(() => {
                intervalC = createIntervalForRaftConsensusAlgorithm('c', raftConsensusAlgorithm3);
            }, 8000);
            break;
        case 'd':
            clearInterval(intervalD);
            setTimeout(() => {
                intervalD = createIntervalForRaftConsensusAlgorithm('d', raftConsensusAlgorithm4);
            }, 8000);
            break;
        case 'e':
            clearInterval(intervalE);
            setTimeout(() => {
                intervalE = createIntervalForRaftConsensusAlgorithm('e', raftConsensusAlgorithm5);
            }, 8000);
            break;
    }

    console.log(`Stopped '${leader}'`);
    leader = null;
}, 10000);

function createIntervalForRaftConsensusAlgorithm(id: string, raftConsensusAlgorithm: RaftConsensusAlgorithm): NodeJS.Timer {
    console.log(`Started '${id}'`);
    return setInterval(() => {
        raftConsensusAlgorithm.tick(id, [
            'a',
            'b',
            'c',
            'd',
            'e',
        ].filter((x) => x !== id));

        if (raftConsensusAlgorithm.isLeader()) {
            console.log(`${id}: I'm the leader.`);
            leader = id;
        }
    }, 1000);
}
