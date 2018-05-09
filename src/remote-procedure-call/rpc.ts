import * as uuid from 'uuid';
import { Message } from './models/message';

export abstract class RPC {

    protected correlationActions: {} = null;

    protected requestTimeout: number = 2000;

    constructor(
        protected handleMessageFn: (message: Message) => Promise<any>,
    ) {
        this.correlationActions = {};
    }

    public abstract close(): void;

    public send(message: Message): Promise<Message> {
        return new Promise((resolve: (message: Message) => void, reject: (error: Error) => void) => {
            message.correlationId = uuid.v4();

            this.correlationActions[message.correlationId] = {
                reject,
                resolve,
            };

            this.sendMessage(message);
        });
    }

    protected handleMessage(message: Message): void {
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
            this.handleMessageFn(message).then((response: any) => {
                this.sendMessage(new Message(message.command, message.correlationId, response));
            });
        }

        this.setTimeoutForCorrelationAction(message.correlationId);
    }

    protected hasCorrelationAction(correlationId: string): boolean {
        return this.correlationActions[correlationId] ? true : false;
    }

    protected setTimeoutForCorrelationAction(correlationId: string): void {
        setTimeout(() => {
            if (this.hasCorrelationAction(correlationId)) {

                const action: {
                    reject: (error: Error) => void,
                    resolve: (message: Message) => void,
                } = this.correlationActions[correlationId];

                if (action.reject) {
                    action.reject(new Error('TIMEOUT'));
                }

                this.correlationActions[correlationId].reject = undefined;
                this.correlationActions[correlationId].resolve = undefined;
            }
        }, this.requestTimeout);
    }

    protected abstract sendMessage(message: Message): void;

}
