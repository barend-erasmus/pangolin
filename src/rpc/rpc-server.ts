import * as net from 'net';
import { Message } from './message';
import { RPC } from './rpc';

export class RPCServer {

    protected onMessageAction: (message: Message) => any;

    protected rpcs: RPC[] = null;

    protected server: net.Server = null;

    constructor(protected port: number) {
        this.server = net.createServer((socket: net.Socket) => {
            const rpc: RPC = new RPC(socket);

            rpc.setOnMessageAction(this.onMessageAction);

            this.rpcs.push(rpc);
        });

        this.listen();
    }

    public send(action: (message: Message) => void, message: Message): void {

    }

    public setOnMessageAction(action: (message: Message) => any): void {
        this.onMessageAction = action;

        for (const rpc of this.rpcs) {
            rpc.setOnMessageAction(action);
        }
    }

    protected listen(): void {
        this.server.listen();
    }
}
