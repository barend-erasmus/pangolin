export interface ITransportProtocol {

    ping(node: string): Promise<boolean>;

    proposedLeader(node: string, proposedLeader: string): Promise<boolean>;

}
