import { CoordinatorRequest } from './models/coordinator-request';
import { ElectionRequest } from './models/election-request';
import { OKRequest } from './models/ok-request';

export class BullyConsensusAlgorithm {

    protected lastCoordinatorRequestTimestamp: Date = null;

    protected lastElectionRequestTimestamp: Date = null;

    protected leader: string = null;

    protected timeout: number = null;

    constructor(
        protected id: string,
        protected peerIds: string[],
        protected sendCoordinatorRequest: (coordinatorRequest: CoordinatorRequest, id: string) => void,
        protected sendElectionRequest: (electionRequest: ElectionRequest, id: string) => void,
        protected sendOKRequest: (id: string, okRequest: OKRequest) => void,
    ) {
        this.timeout = 3000;
    }

    public onCoordinatorRequest(coordinatorRequest: CoordinatorRequest, id: string): void {
        this.lastCoordinatorRequestTimestamp = new Date();
        this.lastElectionRequestTimestamp = null;
        this.leader = id;

        console.log(this.leader);
    }

    public onElectionRequest(electionRequest: ElectionRequest, id: string): void {
        if (id < this.id) {
            this.sendCoordinatorRequests();
        } else {
            this.sendOKRequest(id, new OKRequest());
        }
    }

    public onOKRequest(id: string, okResponse: OKRequest): void {
        if (id > this.id) {
            this.lastCoordinatorRequestTimestamp = null;
            this.lastElectionRequestTimestamp = null;
        }
    }

    public async tick(): Promise<void> {
        if (this.isLeader()) {
            this.sendCoordinatorRequests();
            return;
        }

        if (!this.lastElectionRequestTimestamp && (!this.lastCoordinatorRequestTimestamp || this.lastCoordinatorRequestTimestamp.getTime() + this.timeout < new Date().getTime())) {
            this.startElection();
        }
    }

    protected isLeader(): boolean {
        return this.id === this.leader;
    }

    protected sendCoordinatorRequests(): void {
        for (const id of this.peerIds) {
            if (id < this.id) {
                this.sendCoordinatorRequest(new CoordinatorRequest(), id);
            }
        }
    }

    protected startElection(): void {
        this.lastElectionRequestTimestamp = new Date();

        for (const id of this.peerIds) {
            if (id > this.id) {
                this.sendElectionRequest(new ElectionRequest(), id);
            }
        }
    }

}
