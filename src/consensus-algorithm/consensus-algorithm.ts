import { ITransportProtocol } from './interfaces/transport-protocol';

export class ConsensusAlgorithm {

    protected lastTickTimestamp: Date = null;

    protected leader: string = null;

    constructor(
        protected node: string,
        protected nodes: string[],
        protected transportProtocol: ITransportProtocol,
    ) {

    }

    public async getLeader(): Promise<string> {
        if (!this.leader) {
            await this.setLeader();
        }

        return this.leader;
    }

    public async tick(): Promise<void> {
        if (!this.lastTickTimestamp) {
            await this.setLeader();

            this.lastTickTimestamp = new Date();

            return;
        }

        if (new Date().getTime() > this.lastTickTimestamp.getTime() + 10000) {
            await this.setLeader();

            this.lastTickTimestamp = new Date();

            return;
        }
    }

    protected async setLeader(): Promise<void> {
        let proposedLeader: string = null;

        for (const node of this.nodes) {
            const nodeAlive: boolean = await this.transportProtocol.ping(node);

            if (nodeAlive) {
                proposedLeader = node;

                break;
            }
        }

        let voteCount: number = 0;

        for (const node of this.nodes) {
            if (node === proposedLeader) {
                continue;
            }

            const result: boolean = await this.transportProtocol.proposedLeader(node, proposedLeader);

            if (result) {
                voteCount++;
            }
        }

        if (voteCount > Math.floor(this.nodes.length / 2)) {
            this.leader = proposedLeader;

            console.log(this.leader);
        }
    }

}
