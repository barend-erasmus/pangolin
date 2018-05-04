export class ConsensusAlgorithm {

    protected leader: string = null;

    constructor(
        protected nodes: string[],
    ) {

    }

    public async getLeader(): Promise<string> {
        if (!this.leader) {
            await this.setLeader();
        }

        return this.leader;
    }

    public async setLeader(): Promise<void> {
        let proposedLeader: string = null;

        for (const node of this.nodes) {
            const nodeAlive: boolean = await this.isNodeAlive(node);

            if (nodeAlive) {
                proposedLeader = node;
            }
        }

        let voteCount: number = 0;

        for (const node of this.nodes) {
            if (node === proposedLeader) {
                continue;
            }

            const result: boolean = await this.sendProposedLeader(node, proposedLeader);

            if (result) {
                voteCount ++;
            }
        }

        if (voteCount > Math.floor(this.nodes.length / 2)) {
            this.leader = proposedLeader;
        }
    }

    protected async sendProposedLeader(node: string, proposedLeader: string): Promise<boolean> {
        return true;
    }

    protected async isNodeAlive(node: string): Promise<boolean> {
        return true;
    }

}
