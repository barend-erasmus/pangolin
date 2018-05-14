import { BullyConsensusAlgorithm } from './bullly-consensus-algorithm/bully-consensus-algorithm';
import { CoordinatorRequest } from './bullly-consensus-algorithm/models/coordinator-request';
import { ElectionRequest } from './bullly-consensus-algorithm/models/election-request';
import { OKRequest } from './bullly-consensus-algorithm/models/ok-request';

let bullyConsensusAlgorithms: {} = {};

const bullyConsensusAlgorithm1: BullyConsensusAlgorithm = new BullyConsensusAlgorithm('a', [
    'a',
    'b',
    'c',
    'd',
    'e',
], (coordinatorRequest: CoordinatorRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onCoordinatorRequest(coordinatorRequest, 'a');
}, (electionRequest: ElectionRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onElectionRequest(electionRequest, 'a');
}, (id: string, okRequest: OKRequest) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onOKRequest('a', okRequest);
});

const bullyConsensusAlgorithm2: BullyConsensusAlgorithm = new BullyConsensusAlgorithm('b', [
    'a',
    'b',
    'c',
    'd',
    'e',
], (coordinatorRequest: CoordinatorRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onCoordinatorRequest(coordinatorRequest, 'b');
}, (electionRequest: ElectionRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onElectionRequest(electionRequest, 'b');
}, (id: string, okRequest: OKRequest) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onOKRequest('b', okRequest);
});

const bullyConsensusAlgorithm3: BullyConsensusAlgorithm = new BullyConsensusAlgorithm('c', [
    'a',
    'b',
    'c',
    'd',
    'e',
], (coordinatorRequest: CoordinatorRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onCoordinatorRequest(coordinatorRequest, 'c');
}, (electionRequest: ElectionRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onElectionRequest(electionRequest, 'c');
}, (id: string, okRequest: OKRequest) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onOKRequest('c', okRequest);
});

const bullyConsensusAlgorithm4: BullyConsensusAlgorithm = new BullyConsensusAlgorithm('d', [
    'a',
    'b',
    'c',
    'd',
    'e',
], (coordinatorRequest: CoordinatorRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onCoordinatorRequest(coordinatorRequest, 'd');
}, (electionRequest: ElectionRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onElectionRequest(electionRequest, 'd');
}, (id: string, okRequest: OKRequest) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onOKRequest('d', okRequest);
});

const bullyConsensusAlgorithm5: BullyConsensusAlgorithm = new BullyConsensusAlgorithm('e', [
    'a',
    'b',
    'c',
    'd',
    'e',
], (coordinatorRequest: CoordinatorRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onCoordinatorRequest(coordinatorRequest, 'e');
}, (electionRequest: ElectionRequest, id: string) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onElectionRequest(electionRequest, 'e');
}, (id: string, okRequest: OKRequest) => {
    (bullyConsensusAlgorithms[id] as BullyConsensusAlgorithm).onOKRequest('e', okRequest);
});

bullyConsensusAlgorithms = {
    a: bullyConsensusAlgorithm1,
    b: bullyConsensusAlgorithm2,
    c: bullyConsensusAlgorithm3,
    d: bullyConsensusAlgorithm4,
    e: bullyConsensusAlgorithm5,
};

let leader: string = null;

let intervalA: NodeJS.Timer = createIntervalForBullyConsensusAlgorithm('a', bullyConsensusAlgorithm1);
let intervalB: NodeJS.Timer = createIntervalForBullyConsensusAlgorithm('b', bullyConsensusAlgorithm2);
let intervalC: NodeJS.Timer = createIntervalForBullyConsensusAlgorithm('c', bullyConsensusAlgorithm3);
let intervalD: NodeJS.Timer = createIntervalForBullyConsensusAlgorithm('d', bullyConsensusAlgorithm4);
let intervalE: NodeJS.Timer = createIntervalForBullyConsensusAlgorithm('e', bullyConsensusAlgorithm5);

setInterval(() => {
    if (!leader) {
        return;
    }
    switch (leader) {
        case 'a':
            clearInterval(intervalA);
            setTimeout(() => {
                intervalA = createIntervalForBullyConsensusAlgorithm('a', bullyConsensusAlgorithm1);
            }, 8000);
            break;
        case 'b':
            clearInterval(intervalB);
            setTimeout(() => {
                intervalB = createIntervalForBullyConsensusAlgorithm('b', bullyConsensusAlgorithm2);
            }, 8000);
            break;
        case 'c':
            clearInterval(intervalC);
            setTimeout(() => {
                intervalC = createIntervalForBullyConsensusAlgorithm('c', bullyConsensusAlgorithm3);
            }, 8000);
            break;
        case 'd':
            clearInterval(intervalD);
            setTimeout(() => {
                intervalD = createIntervalForBullyConsensusAlgorithm('d', bullyConsensusAlgorithm4);
            }, 8000);
            break;
        case 'e':
            clearInterval(intervalE);
            setTimeout(() => {
                intervalE = createIntervalForBullyConsensusAlgorithm('e', bullyConsensusAlgorithm5);
            }, 8000);
            break;
    }

    console.log(`Stopped '${leader}'`);
    leader = null;
}, 10000);

function createIntervalForBullyConsensusAlgorithm(id: string, bullyConsensusAlgorithm: BullyConsensusAlgorithm): NodeJS.Timer {
    console.log(`Started '${id}'`);
    return setInterval(() => {
        bullyConsensusAlgorithm.tick();

        // if (bullyConsensusAlgorithm.isLeader()) {
        //     leader = id;
        // }
    }, 1000);
}
