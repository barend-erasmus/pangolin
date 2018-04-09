export class State {

    constructor(
        public term: number,
        public isCandidate: boolean,
        public isFollower: boolean,
        public isLeader: boolean,
        public votedFor: string,
    ) {

    }

    public setAsCandidate(): void {
        this.isCandidate = true;
        this.isFollower = false;
        this.isLeader = false;
    }

    public setAsFollower(): void {
        this.isCandidate = false;
        this.isFollower = true;
        this.isLeader = false;
    }

    public setAsLeader(): void {
        this.isCandidate = false;
        this.isFollower = false;
        this.isLeader = true;
    }

}
