import { LogEntry } from './models/log-entry';
import { RaftConsensusAlgorithm } from './raft-consensus-algorithm';
import { AppendEntriesRequest } from './models/append-entries-request';
import { VoteRequest } from './models/vote-request';

const raftConsensusAlgorithm1 = new RaftConsensusAlgorithm(async (logEntry: LogEntry) => {
    
}, async (appendEntriesRequest: AppendEntriesRequest, id: string) => {
    return (raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).appendEntries(JSON.parse(JSON.stringify(appendEntriesRequest)));
}, async (voteRequest: VoteRequest) => {
    return Object.keys(this.raftConsensusAlgorithms).map((id: string) => (this.raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).requestVote(JSON.parse(JSON.stringify(voteRequest))));
});

const raftConsensusAlgorithm2 = new RaftConsensusAlgorithm(async (logEntry: LogEntry) => {
    
}, async (appendEntriesRequest: AppendEntriesRequest, id: string) => {
    return (raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).appendEntries(JSON.parse(JSON.stringify(appendEntriesRequest)));
}, async (voteRequest: VoteRequest) => {
    return Object.keys(this.raftConsensusAlgorithms).map((id: string) => (this.raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).requestVote(JSON.parse(JSON.stringify(voteRequest))));
});

const raftConsensusAlgorithm3 = new RaftConsensusAlgorithm(async (logEntry: LogEntry) => {
    
}, async (appendEntriesRequest: AppendEntriesRequest, id: string) => {
    return (raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).appendEntries(JSON.parse(JSON.stringify(appendEntriesRequest)));
}, async (voteRequest: VoteRequest) => {
    return Object.keys(this.raftConsensusAlgorithms).map((id: string) => (this.raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).requestVote(JSON.parse(JSON.stringify(voteRequest))));
});

const raftConsensusAlgorithm4 = new RaftConsensusAlgorithm(async (logEntry: LogEntry) => {
    
}, async (appendEntriesRequest: AppendEntriesRequest, id: string) => {
    return (raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).appendEntries(JSON.parse(JSON.stringify(appendEntriesRequest)));
}, async (voteRequest: VoteRequest) => {
    return Object.keys(this.raftConsensusAlgorithms).map((id: string) => (this.raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).requestVote(JSON.parse(JSON.stringify(voteRequest))));
});

const raftConsensusAlgorithm5 = new RaftConsensusAlgorithm(async (logEntry: LogEntry) => {
    
}, async (appendEntriesRequest: AppendEntriesRequest, id: string) => {
    return (raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).appendEntries(JSON.parse(JSON.stringify(appendEntriesRequest)));
}, async (voteRequest: VoteRequest) => {
    return Object.keys(this.raftConsensusAlgorithms).map((id: string) => (this.raftConsensusAlgorithms[id] as RaftConsensusAlgorithm).requestVote(JSON.parse(JSON.stringify(voteRequest))));
});

const raftConsensusAlgorithms: {} = {
    a: raftConsensusAlgorithm1,
    b: raftConsensusAlgorithm2,
    c: raftConsensusAlgorithm3,
    d: raftConsensusAlgorithm4,
    e: raftConsensusAlgorithm5,
};

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
