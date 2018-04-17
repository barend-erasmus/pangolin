# Raft Consensus Algorithm

[White Paper](https://raft.github.io/raft.pdf)

## Append Entries
    
* Reply `false` if `term` < `currentTerm`.
* Reply `false` if log doesn't contain an entry at `previousLogIndex` whose term matches `previousLogTerm`.
* If an existing entry conflicts with a new one (same index but different terms), delete the existing entry and all that follow it.
* Append any new entries not already in the log.
* If `leaderCommit` > `commitIndex`, set `commitIndex` = min(`leaderCommit`, `index of last new entry`);

## Request Vote

* Reply `false` if `term` < `currentTerm`
* If `votedFor` is `null` or `candidateId`, and candidate’s log is at least as up-to-date as receiver’s log, grant vote.
