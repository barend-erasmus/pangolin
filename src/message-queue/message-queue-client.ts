import * as uuid from 'uuid';
import * as WebSocket from 'ws';
import { CommandBuilder } from './builders/command-builder';
import { Command } from './commands/command';
import { PublishCommand } from './commands/publish';
import { SubscribeCommand } from './commands/subscribe';

export class MessageQueueClient {

    protected socket: WebSocket = null;

    constructor(
        protected host: string,
        protected onMessageFn: (channel: string, data: any, messageQueueClient: MessageQueueClient) => void,
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

    public send(channel: string, data: any): void {
        this.socket.send(JSON.stringify(new PublishCommand(channel, data)));
    }

    protected onClose(closeEvent: { code: number }): void {
        if (closeEvent.code === 1000) {
            return;
        }

        this.connect();
    }

    protected onMessage(event: { data: any }): void {
        const commandBuilder: CommandBuilder = new CommandBuilder();

        const command: Command = commandBuilder.build(JSON.parse(event.data));

        if (command instanceof PublishCommand) {
            const publishCommand: PublishCommand = command as PublishCommand;

            if (this.onMessageFn) {
                this.onMessageFn(publishCommand.channel, publishCommand.data, this);
            }
        }
    }

    protected onOpen(event: {}, callback: () => void): void {
        if (this.socket.readyState === 1) {
            for (const channel of this.subscribedChannels) {
                const subscribeCommand: SubscribeCommand = new SubscribeCommand(channel);
                this.socket.send(JSON.stringify(subscribeCommand));
            }

            callback();
        }
    }

}
