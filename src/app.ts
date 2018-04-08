import { HeartbeatRequest } from './raft-consensus-algorithm/models/heartbeat-request';
import { LogEntry } from './raft-consensus-algorithm/models/log-entry';
import { State } from './raft-consensus-algorithm/models/state';
import { VoteRequest } from './raft-consensus-algorithm/models/vote-request';
import { RaftConsensusAlgorithm } from './raft-consensus-algorithm/raft-consensus-algorithm';

const node1: RaftConsensusAlgorithm = new RaftConsensusAlgorithm();
const node2: RaftConsensusAlgorithm = new RaftConsensusAlgorithm();
const node3: RaftConsensusAlgorithm = new RaftConsensusAlgorithm();

node1.setOnSendHeartbeatRequest(async (state: State) => {
    console.log(`node1 => onSendAppendEntriesRequest`);

    const heartbeatRequest: HeartbeatRequest = new HeartbeatRequest(state.term);

    return [
        node2.handleHeartbeatRequest(heartbeatRequest),
        node3.handleHeartbeatRequest(heartbeatRequest),
    ];
});

node1.setOnSendVoteRequest(async (state: State) => {
    console.log(`node1 => onSendVoteRequest`);

    const voteRequest: VoteRequest = new VoteRequest('node1', state.term);

    return [
        node2.handleVoteRequest(voteRequest),
        node3.handleVoteRequest(voteRequest),
    ];
});

node2.setOnSendHeartbeatRequest(async (state: State) => {
    console.log(`node2 => onSendAppendEntriesRequest`);

    const heartbeatRequest: HeartbeatRequest = new HeartbeatRequest(state.term);

    return [
        node1.handleHeartbeatRequest(heartbeatRequest),
        node3.handleHeartbeatRequest(heartbeatRequest),
    ];
});

node2.setOnSendVoteRequest(async (state: State) => {
    console.log(`node2 => onSendVoteRequest`);

    const voteRequest: VoteRequest = new VoteRequest('node2', state.term);

    return [
        node1.handleVoteRequest(voteRequest),
        node3.handleVoteRequest(voteRequest),
    ];
});

node3.setOnSendHeartbeatRequest(async (state: State) => {
    console.log(`node3 => onSendAppendEntriesRequest`);

    const heartbeatRequest: HeartbeatRequest = new HeartbeatRequest(state.term);

    return [
        node1.handleHeartbeatRequest(heartbeatRequest),
        node2.handleHeartbeatRequest(heartbeatRequest),
    ];
});

node3.setOnSendVoteRequest(async (state: State) => {
    console.log(`node3 => onSendVoteRequest`);

    const voteRequest: VoteRequest = new VoteRequest('node3', state.term);

    return [
        node1.handleVoteRequest(voteRequest),
        node2.handleVoteRequest(voteRequest),
    ];
});

setInterval(() => {
    node1.tick();
    node2.tick();
    node3.tick();
}, 1000);
