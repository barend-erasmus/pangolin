import { HashProcessEvent } from './events/hash-process';
import { Message } from './models/message';

export class Client {

    private clientIds: string[] = [];

    private id: string = null;

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

    public sendHashProcessEventBroadcast(event: HashProcessEvent): void {
        this.socket.send(JSON.stringify(new Message(JSON.stringify(event), this.id, null, 'broadcast')));
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

        if (message.type === 'list-clients') {
            this.clientIds = JSON.parse(message.data);
            this.id = message.to;
        } else if (message.type === 'client-opened') {
            this.socket.send(JSON.stringify(new Message(null, null, null, 'list-clients')));
        } else if (message.type === 'client-closed') {
            this.socket.send(JSON.stringify(new Message(null, null, null, 'list-clients')));
        } else {
            this.onMessageFn(message);
        }
    }

    private onOpen(): void {
        this.socket.send(JSON.stringify(new Message('123456', null, null, 'set-key')));

        this.socket.send(JSON.stringify(new Message(null, null, null, 'list-clients')));
    }

}
