import * as WebSocket from 'ws';
import { Connection } from './models/connection';
import { Message } from './models/message';

export class WebSocketRelayServer {

    protected connections: Connection[] = null;

    protected server: WebSocket.Server = null;

    constructor(protected port: number) {
        this.connections = [];
    }

    public close(): void {
        this.server.close();
    }

    public listen(): void {
        this.server = new WebSocket.Server({ port: this.port });

        this.addListenersToServer();
    }

    protected addListenersToServer(): void {
        this.server.on('connection', (socket: WebSocket) => this.onConnection(socket));
    }

    protected handleMessageToServer(connection: Connection, message: Message): void {
        if (message.command === 'handshake') {
            connection.id = message.payload.id;
            connection.metadata = message.payload.metadata;

            this.connections.push(connection);

            this.sendMessage(connection, new Message(message.command, message.correlationId, 'server', 'OK', message.from));
            return;
        }

        if (message.command === 'connections') {
            this.sendMessage(connection, new Message(message.command, message.correlationId, 'server', this.connections.filter((x) => x.id !== connection.id).map((x) => {
                return {
                    id: x.id,
                    metadata: x.metadata,
                };
            }), message.from));

            return;
        }
    }

    protected onConnection(socket: WebSocket): void {
        const connection: Connection = new Connection(null, null, socket);

        connection.socket.on('message', (data: WebSocket.Data) => this.onMessage(connection, data));

        connection.socket.on('close', () => {
            const index: number = this.connections.indexOf(connection);

            if (index > -1) {
                this.connections.splice(index, 1);
            }
        });
    }

    protected onMessage(connection: Connection, data: WebSocket.Data): void {
        const message: Message = JSON.parse(data.toString());

        if (message.to === 'server') {
            this.handleMessageToServer(connection, message);
            return;
        }

        const toConnection: Connection = this.connections.find((x) => x.id === message.to);

        if (toConnection) {
            this.sendMessage(toConnection, message);
        }
    }

    protected sendMessage(connection: Connection, message: Message): void {
        connection.socket.send(JSON.stringify(message));
    }

}
