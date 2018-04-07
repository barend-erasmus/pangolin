import * as net from 'net';
import { Logger } from './logger';
import { Message } from './models/message';
import { RPC } from './rpc';

export class RPCServer {

    protected onMessageAction: (message: Message) => any = null;

    protected rpcs: RPC[] = null;

    protected server: net.Server = null;

    constructor(
        protected logger: Logger,
        protected port: number,
    ) {
        this.rpcs = [];

        this.server = net.createServer((socket: net.Socket) => {
            const rpc: RPC = new RPC(logger, socket);

            rpc.setOnMessageAction(this.onMessageAction);

            this.rpcs.push(rpc);
        });
    }

    public close(): void {
        for (const rpc of this.rpcs) {
            rpc.close();
        }

        this.server.close();
    }

    public listen(): void {
        this.server.listen(this.port);
    }

    public send(message: Message): void {
        for (const rpc of this.rpcs) {
            rpc.send(message);
        }
    }

    public setOnMessageAction(action: (message: Message) => any): void {
        this.onMessageAction = action;

        for (const rpc of this.rpcs) {
            rpc.setOnMessageAction(action);
        }
    }

}
