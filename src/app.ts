import { AppendEntriesRequest } from './raft-consensus-algorithm/models/append-entries-request';
import { LogEntry } from './raft-consensus-algorithm/models/log-entry';
import { State } from './raft-consensus-algorithm/models/state';
import { VoteRequest } from './raft-consensus-algorithm/models/vote-request';
import { RaftConsensusAlgorithm } from './raft-consensus-algorithm/raft-consensus-algorithm';

const node1: RaftConsensusAlgorithm = new RaftConsensusAlgorithm();
const node2: RaftConsensusAlgorithm = new RaftConsensusAlgorithm();
const node3: RaftConsensusAlgorithm = new RaftConsensusAlgorithm();

node1.setOnSendAppendEntriesRequest(async (logEntries: LogEntry[], state: State) => {
    console.log(`node1 => onSendAppendEntriesRequest`);

    const handleAppendEntriesRequest: AppendEntriesRequest = new AppendEntriesRequest(state.votedFor, logEntries, state.term);

    return [
        node2.handleAppendEntriesRequest(handleAppendEntriesRequest),
        node3.handleAppendEntriesRequest(handleAppendEntriesRequest),
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

node2.setOnSendAppendEntriesRequest(async (logEntries: LogEntry[], state: State) => {
    console.log(`node2 => onSendAppendEntriesRequest`);

    const handleAppendEntriesRequest: AppendEntriesRequest = new AppendEntriesRequest(state.votedFor, logEntries, state.term);

    return [
        node1.handleAppendEntriesRequest(handleAppendEntriesRequest),
        node3.handleAppendEntriesRequest(handleAppendEntriesRequest),
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

node3.setOnSendAppendEntriesRequest(async (logEntries: LogEntry[], state: State) => {
    console.log(`node3 => onSendAppendEntriesRequest`);

    const handleAppendEntriesRequest: AppendEntriesRequest = new AppendEntriesRequest(state.votedFor, logEntries, state.term);

    return [
        node1.handleAppendEntriesRequest(handleAppendEntriesRequest),
        node2.handleAppendEntriesRequest(handleAppendEntriesRequest),
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
