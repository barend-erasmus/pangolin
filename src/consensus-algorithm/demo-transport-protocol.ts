import { ITransportProtocol } from './interfaces/transport-protocol';

export class DemoTransportProtocol implements ITransportProtocol {

    protected deadNode: string = null;

    constructor(protected nodes: string[]) {
        setInterval(() => {
            if (!this.deadNode) {
                this.deadNode = 'node-1';
                return;
            }

            if (this.deadNode === 'node-1') {
                this.deadNode = 'node-2';
                return;
            }

            if (this.deadNode === 'node-2') {
                this.deadNode = 'node-1';
                return;
            }
        }, 12000);
    }

    public async ping(node: string): Promise<boolean> {
        if (node === this.deadNode) {
            return false;
        }

        return true;
    }

    public async proposedLeader(node: string, proposedLeader: string): Promise<boolean> {
        return true;
    }
}
