import * as net from 'net';
import * as uuid from 'uuid';
import { IMessageHandler } from './interfaces/message-handler';
import { Message } from './models/message';
import { RPC } from './rpc';

export class TCPRPC extends RPC {

    constructor(
        messageHandler: IMessageHandler,
        protected socket: net.Socket,
    ) {
        super(messageHandler);

        this.addListenersToSocket();
    }

    public close(): void {
        this.socket.destroy();
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

                    this.handleMessage(message);

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

    protected sendMessage(message: Message): void {
        const json = JSON.stringify(message);

        this.socket.write(`${json}\n`);
    }

}
