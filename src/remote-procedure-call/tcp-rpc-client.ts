import * as net from 'net';
import { IMessageHandler } from './interfaces/message-handler';
import { Message } from './models/message';
import { RPC } from './rpc';
import { TCPRPC } from './tcp-rpc';

export class TCPRPCClient {

    protected rpc: RPC = null;

    protected socket: net.Socket = null;

    constructor(
        protected host: string,
        protected messageHandler: IMessageHandler,
        protected port: number,
    ) {
        this.socket = new net.Socket();
    }

    public close(): void {
        this.rpc.close();
    }

    public connect(): Promise<void> {
        return new Promise((resolve: () => void, reject: (error: Error) => void) => {
            this.socket.connect(this.port, this.host, (error: Error) => {
                if (error) {
                    reject(error);
                    return;
                }

                this.rpc = new TCPRPC(this.messageHandler, this.socket);

                resolve();
            });
        });
    }

    public send(message: Message): Promise<Message> {
        return this.rpc.send(message);
    }

}
