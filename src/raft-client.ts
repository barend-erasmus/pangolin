import { RaftClientTickAction } from './enums/raft-client-tick-action';

export class RaftClient {

    public electionExpiry: number = null;

    public electionTimeoutInMilliseconds: number = null;

    public leader: string = null;

    public numberOfNodes: number = null;

    public numberOfVotes: number = null;

    public state: string = 'follower';

    public term: number = 0;

    constructor(
        public id: string,
    ) {
        this.setElectionExpiry();
    }

    public heartbeat(id: string, term: number): void {
        if (term > this.term) {
            this.setAsFollower(id, term);
        }

        if (term >= this.term) {
            this.setElectionExpiry();
        }
    }

    public vote(id: string, term: number): boolean {
        if (term > this.term) {
            this.setLeader(id);
            this.term = term;

            this.setElectionExpiry();

            return true;
        }

        return false;
    }

    public receiveVote(term: number): void {
        if (term === this.term) {
            this.numberOfVotes++;
        }
    }

    public setNumberOfNodes(numberOfNodes: number): void {
        this.numberOfNodes = this.numberOfVotes;
    }

    public tick(): RaftClientTickAction {
        const currentTimestamp: Date = new Date();

        if (this.state === 'follower') {
            if (currentTimestamp.getTime() > this.electionExpiry) {
                this.setAsCandidate();

                return RaftClientTickAction.REQUEST_VOTES;
            }
        } else if (this.state === 'candidate') {
            if (Math.ceil(this.numberOfNodes / 2) < this.numberOfVotes) {
                this.setAsLeader();

                return RaftClientTickAction.SEND_HEARTBEAT;
            }
        } else if (this.state === 'leader') {
            return RaftClientTickAction.SEND_HEARTBEAT;
        }

        return RaftClientTickAction.NONE;
    }

    private setAsCandidate(): void {
        this.numberOfVotes = 1;
        this.state = 'candidate';
        this.term++;

        console.log(`'${this.id}' changed to '${this.state}'`);
    }

    private setAsFollower(leader: string, term: number): void {
        this.leader = leader ? leader : this.leader;
        this.numberOfVotes = null;
        this.state = 'follower';
        this.term = term ? term : this.term;

        console.log(`'${this.id}' changed to '${this.state}'`);
    }

    private setAsLeader(): void {
        this.numberOfVotes = null;
        this.state = 'leader';

        console.log(`'${this.id}' changed to '${this.state}'`);
    }

    private setElectionExpiry(): void {
        this.electionTimeoutInMilliseconds = (Math.random() * 10000) + 5000;
        this.electionExpiry = new Date().getTime() + this.electionTimeoutInMilliseconds;
    }

    private setLeader(id: string): void {
        this.leader = id;

        console.log(`leader set to '${this.leader}'`);
    }

}
