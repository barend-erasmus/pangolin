import * as net from 'net';
import { IMessageHandler } from './interfaces/message-handler';
import { Message } from './models/message';
import { RPC } from './rpc';

export class RPCServer {

    protected rpcs: RPC[] = null;

    protected server: net.Server = null;

    constructor(
        protected messageHandler: IMessageHandler,
        protected port: number,
    ) {
        this.rpcs = [];

        this.server = net.createServer((socket: net.Socket) => {
            const rpc: RPC = new RPC(this.messageHandler, socket);

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

}
