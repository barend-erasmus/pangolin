import * as net from 'net';
import * as uuid from 'uuid';
import { IMessageHandler } from './interfaces/message-handler';
import { Message } from './models/message';

export class RPC {

    protected correlationActions: {} = null;

    constructor(
        protected messageHandler: IMessageHandler,
        protected socket: net.Socket,
    ) {
        this.correlationActions = {};

        this.addListenersToSocket();
    }

    public close(): void {
        this.socket.destroy();
    }

    public send(message: Message): Promise<Message> {
        return new Promise((resolve: (message: Message) => void, reject: (error: Error) => void) => {
            message.correlationId = uuid.v4();

            this.correlationActions[message.correlationId] = {
                reject,
                resolve,
            };

            this.sendMessage(message, this.socket);
        });
    }

    protected addListenersToSocket(): void {
        let socketBuffer: Buffer = new Buffer(1024);
        let socketBufferIndex: number = -1;

        this.socket.on('error', (err: Error) => {

        });

        this.socket.on('data', (data: Buffer) => {
            for (const char of data) {
                if (!char) {
                    continue;
                }

                if (char === 10) {
                    const messageBuffer: Buffer = socketBuffer.slice(0, socketBufferIndex + 1);

                    socketBuffer = new Buffer(1024);
                    socketBufferIndex = -1;

                    const json: string = messageBuffer.toString();

                    const message: Message = JSON.parse(json);

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
                            this.sendMessage(new Message(message.command, message.correlationId, response), this.socket);
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

                    continue;
                }

                socketBufferIndex++;
                socketBuffer.writeInt8(char, socketBufferIndex);
            }

            socketBuffer = new Buffer(1024);
        });
    }

    protected hasCorrelationAction(correlationId: string): boolean {
        return this.correlationActions[correlationId] ? true : false;
    }

    protected sendMessage(message: Message, socket: net.Socket): void {
        const json = JSON.stringify(message);

        socket.write(`${json}\n`);
    }

}
