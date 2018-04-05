import * as net from 'net';
import { Message } from './message';

export class RPC {

    protected onMessageAction: (message: Message) => any;

    constructor(
        protected socket: net.Socket,
    ) {

    }

    public setOnMessageAction(action: (message: Message) => any): void {
        this.onMessageAction = action;
    }

    protected addListenersToSocket(): void {
        let socketBuffer: Buffer = new Buffer(1024);
        let socketBufferIndex: number = 0;

        this.socket.on('error', (err: Error) => {

        });

        this.socket.on('data', (data: Buffer) => {
            for (const char of data) {
                if (!char) {
                    continue;
                }

                if (char === 10) {
                    const messageBuffer: Buffer = socketBuffer.slice(0, socketBufferIndex);

                    console.log(messageBuffer.toString());
                    continue;
                }

                socketBufferIndex++;
                socketBuffer.writeInt8(char, socketBufferIndex);
            }

            socketBuffer = new Buffer(1024);
        });
    }

}
