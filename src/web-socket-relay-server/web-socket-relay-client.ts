import * as uuid from 'uuid';
import * as WebSocket from 'ws';
import { IMessageHandler } from './interfaces/message-handler';
import { Connection } from './models/connection';
import { Message } from './models/message';

export class WebSocketRelayClient {

    public connection: Connection = null;

    public connections: Connection[] = null;

    protected correlationActions: {} = null;

    constructor(
        protected host: string,
        protected messageHandler: IMessageHandler,
    ) {
        this.connection = new Connection(uuid.v4(), {

        }, new WebSocket(this.host));

        this.correlationActions = {};
    }

    public close(): void {
        this.connection.socket.close();
    }

    public connect(): Promise<void> {
        return new Promise((resolve: () => void, reject: (error: Error) => void) => {
            this.connection.socket.on('open', () => {
                this.addListenersToSocket();
                resolve();
            });
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

    public send(message: Message): Promise<Message> {
        return new Promise((resolve: (message: Message) => void, reject: (error: Error) => void) => {
            message.correlationId = uuid.v4();

            this.correlationActions[message.correlationId] = {
                reject,
                resolve,
            };

            this.sendMessage(this.connection, message);
        });
    }

    protected addListenersToSocket(): void {
        this.connection.socket.on('message', (data: WebSocket.Data) => this.onMessage(data));
    }

    protected hasCorrelationAction(correlationId: string): boolean {
        return this.correlationActions[correlationId] ? true : false;
    }

    protected onMessage(data: WebSocket.Data): void {
        const message: Message = JSON.parse(data.toString());

        if (this.hasCorrelationAction(message.correlationId)) {
            const action: {
                reject: (error: Error) => void,
                resolve: (message: Message) => void,
            } = this.correlationActions[message.correlationId];

            if (action.resolve) {
                action.resolve(message);
            }

            delete this.correlationActions[message.correlationId];
        } else {
            this.messageHandler.handle(message).then((response: any) => {
                this.sendMessage(this.connection, new Message(message.command, message.correlationId, message.to, response, message.from));
            });
        }

        setTimeout(() => {
            if (this.hasCorrelationAction(message.correlationId)) {
                const action: {
                    reject: (error: Error) => void,
                    resolve: (message: Message) => void,
                } = this.correlationActions[message.correlationId];

                if (action.reject) {
                    action.reject(new Error('TIMEOUT'));
                }

                this.correlationActions[message.correlationId].reject = undefined;
                this.correlationActions[message.correlationId].resolve = undefined;
            }
        }, 3000);
    }

    protected sendMessage(connection: Connection, message: Message): void {
        connection.socket.send(JSON.stringify(message));
    }

}
