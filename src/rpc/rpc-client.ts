import * as net from 'net';
import { Logger } from './logger';
import { Message } from './models/message';
import { RPC } from './rpc';

export class RPCClient {

    protected rpc: RPC = null;

    protected socket: net.Socket = null;

    constructor(
        protected host: string,
        protected logger: Logger,
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

                this.rpc = new RPC(this.logger, this.socket);

                resolve();
            });
        });
    }

    public send(message: Message): Promise<Message> {
        return this.rpc.send(message);
    }

    public setOnMessageAction(action: (message: Message) => any): void {
        this.rpc.setOnMessageAction(action);
    }

}
