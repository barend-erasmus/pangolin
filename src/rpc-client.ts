import * as uuid from 'uuid';
import { Message } from './models/message';

export class RPCClient {

    public clientIds: string[] = [];

    public id: string = null;

    private pendingRequests: {} = {};

    private socket: WebSocket = null;

    constructor(
        private onMessageFn: (message: Message) => void,
        private webSocketRelayServerHost: string,
    ) {
        this.socket = new WebSocket(this.webSocketRelayServerHost);

        this.initializeListeners();
    }

    public close(): void {
        this.socket.close();
    }

    public send(command: string, correlationId: string, data: any, id: string): Promise<Message> {
        return new Promise((resolve, reject) => {
            correlationId = correlationId ? correlationId : uuid.v4();

            this.socket.send(JSON.stringify(new Message(command, correlationId, data, this.id, id)));

            this.pendingRequests[correlationId] = resolve;
        });
    }

    private initializeListeners(): void {
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

    private onMessage(event: MessageEvent): void {
        const message: Message = JSON.parse(event.data);

        if (message.command === 'client-opened' && message.from === 'server') {
            this.clientIds.push(message.data);
        } else if (message.command === 'client-closed' && message.from === 'server') {
            const index: number = this.clientIds.indexOf(message.data);

            if (index > -1) {
                this.clientIds.splice(index, 1);
            }
        } else {
            const resolve: any = this.pendingRequests[message.correlationId];

            if (!resolve) {
                this.onMessageFn(message);
            } else {
                resolve(message);
            }
        }
    }

    private onOpen(): void {
        this.send('set-key', null, '123456', 'server').then(() => {

        });

        this.send('list-clients', null, '123456', 'server').then((message: Message) => {
            this.clientIds = message.data;
            this.id = message.to;
        });
    }

}
