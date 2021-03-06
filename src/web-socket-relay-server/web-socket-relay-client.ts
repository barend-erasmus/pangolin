import * as uuid from 'uuid';
import * as WebSocket from 'ws';
import { IMessageHandler } from './interfaces/message-handler';
import { Connection } from './models/connection';
import { Message } from './models/message';
import { RPC } from './rpc';

export class WebSocketRelayClient extends RPC {

    public connection: Connection = null;

    public connections: Connection[] = null;

    constructor(
        protected host: string,
        protected messageHandler: IMessageHandler,
    ) {
        super(messageHandler);

        if (typeof (WebSocket) === 'function') {
            this.connection = new Connection(uuid.v4(), {

            }, new WebSocket(this.host));
        }

        if (typeof (WebSocket) === 'object') {
            this.connection = new Connection(uuid.v4(), {

            }, new (window as any).WebSocket(this.host));
        }
    }

    public close(): void {
        this.connection.socket.close();
    }

    public connect(): Promise<void> {
        return new Promise((resolve: () => void, reject: (error: Error) => void) => {
            if (this.connection.socket.readyState === 1) {
                this.addListenersToSocket();
                resolve();
                return;
            }

            this.connection.socket.onerror = () => {
                reject(new Error('Failed to connect'));
            };

            this.connection.socket.onopen = () => {
                if (this.connection.socket.readyState === 1) {
                    this.addListenersToSocket();
                    resolve();
                    return;
                }
            };
        });
    }

    public async handshake(): Promise<void> {
        await this.send(new Message('handshake', null, this.connection.id, {
            id: this.connection.id,
            metadata: this.connection.metadata,
        }, 'server'));

        this.refreshConnections();
    }

    public async refreshConnections(): Promise<void> {
        const connectionsResponse: Message = await this.send(new Message('connections', null, this.connection.id, null, 'server'));

        this.connections = connectionsResponse.payload;
    }

    protected addListenersToSocket(): void {
        this.connection.socket.onmessage = (event: { data: WebSocket.Data }) => this.onMessage(event.data);
    }

    protected onMessage(data: WebSocket.Data): void {
        const message: Message = JSON.parse(data.toString());

        this.handleMessage(message);
    }

    protected sendMessage(message: Message): void {
        this.connection.socket.send(JSON.stringify(message));
    }

}
