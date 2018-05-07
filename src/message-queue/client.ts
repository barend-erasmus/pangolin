import * as uuid from 'uuid';
import * as WebSocket from 'ws';
import { CommandBuilder } from './builders/command-builder';
import { Command } from './commands/command';
import { PublishCommand } from './commands/publish';
import { SubscribeCommand } from './commands/subscribe';

export class Client {

    protected socket: WebSocket = null;

    constructor(
        protected host: string,
        protected onMessageFn: (command: Command, client: Client) => void,
        protected subscribedChannels: string[],
    ) {
    }

    public connect(): Promise<void> {
        return new Promise((resolve: () => void, reject: (err: Error) => void) => {
            if (typeof (WebSocket) === 'function') {
                this.socket = new WebSocket(this.host);
            }

            if (typeof (WebSocket) === 'object') {
                this.socket = new (window as any).WebSocket(this.host);
            }

            this.socket.onclose = (closeEvent: { code: number }) => this.onClose(closeEvent);

            this.socket.onmessage = (event: { data: any }) => this.onMessage(event);

            this.socket.onopen = (openEvent: {}) => this.onOpen(openEvent, resolve);
        });
    }

    public send(command: Command): void {
        this.socket.send(JSON.stringify(command));
    }

    protected onClose(closeEvent: { code: number }): void {
        console.log('Disconnected.');

        if (closeEvent.code === 1000) {
            return;
        }

        console.log('Reconnecting.');
        this.connect();
    }

    protected onMessage(event: { data: any }): void {
        const commandBuilder: CommandBuilder = new CommandBuilder();

        const command: Command = commandBuilder.build(JSON.parse(event.data));

        if (this.onMessageFn) {
            this.onMessageFn(command, this);
        }
    }

    protected onOpen(event: {}, callback: () => void): void {
        if (this.socket.readyState === 1) {
            console.log('Connected.');

            for (const channel of this.subscribedChannels) {
                const subscribeCommand: SubscribeCommand = new SubscribeCommand(channel);
                this.socket.send(JSON.stringify(subscribeCommand));
            }

            callback();
        }
    }

}
