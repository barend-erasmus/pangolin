import * as uuid from 'uuid';
import { ConsoleLogger } from './logger/console';
import { Message } from './models/message';

export class RPCClient {

    protected clients: Array<{ id: string, metadata: any }> = [];

    protected id: string = null;

    protected pendingRequests: {} = {};

    protected socket: WebSocket = null;

    constructor(
        protected consoleLogger: ConsoleLogger,
        protected onMessageFns: Array<(message: Message) => void>,
        protected onOpenFns: Array<() => void>,
        protected webSocketRelayServerHost: string,
    ) {
        this.socket = new WebSocket(this.webSocketRelayServerHost);

        this.initializeListeners();
    }

    public addOnMessageFn(fn: (message: Message) => void): void {
        this.onMessageFns.push(fn);
    }

    public addOnOpenFn(fn: () => void): void {
        this.onOpenFns.push(fn);
    }

    public close(): void {
        this.socket.close();
    }

    public findClientByMetadata(key: string, value: any): {id: string, metadata: any} {
        return this.getClients().find((client) => client.metadata[key] === value);
    }

    public getClients(): Array<{ id: string, metadata: any }> {
        return this.clients;
    }

    public getId(): string {
        return this.id;
    }

    public getNumberOfClients(): number {
        return this.getClients().length;
    }

    public send(command: string, correlationId: string, data: any, id: string): Promise<Message> {
        return new Promise((resolve, reject) => {
            correlationId = correlationId ? correlationId : uuid.v4();

            this.socket.send(JSON.stringify(new Message(command, correlationId, data, this.getId(), id)));

            this.pendingRequests[correlationId] = { resolve, reject };

            setTimeout(() => {
                this.pendingRequests[correlationId] = undefined;

                this.consoleLogger.debug(`send('${command}', '${correlationId}', data, '${id}') -> timeout`);
            }, 2000);
        });
    }

    protected initializeListeners(): void {
        this.socket.onclose = () => {

        };

        this.socket.onmessage = (event: MessageEvent) => {
            this.onMessage(event);
        };

        this.socket.onopen = () => {
            setTimeout(() => {
                this.onOpen();
            }, 3000);
        };
    }

    protected onMessage(event: MessageEvent): void {
        const message: Message = JSON.parse(event.data);

        if (message.command === 'client-opened' && message.from === 'server') {
            this.clients.push(message.data);
        } else if (message.command === 'client-closed' && message.from === 'server') {
            const client = this.clients.find((x) => x.id === message.data.id);
            const index: number = this.clients.indexOf(client);

            if (index > -1) {
                this.clients.splice(index, 1);
            }
        } else {
            const promiseFn: any = this.pendingRequests[message.correlationId];

            if (!promiseFn) {
                for (const onMessageFn of this.onMessageFns) {
                    onMessageFn(message);
                }
            } else if (message.command === 'error') {
                promiseFn.reject(message);
                this.pendingRequests[message.correlationId] = undefined;
            } else {
                promiseFn.resolve(message);
                this.pendingRequests[message.correlationId] = undefined;
            }
        }
    }

    protected onOpen(): void {
        this.send('set-key', null, '123456', 'server').then(() => {

        });

        this.send('list-clients', null, '123456', 'server').then((message: Message) => {
            this.clients = message.data;
            this.id = message.to;
        });

        for (const onOpenFn of this.onOpenFns) {
            onOpenFn();
        }
    }

}
