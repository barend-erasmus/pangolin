import { IMessageHandler } from '../web-socket-relay-server/interfaces/message-handler';
import { Message } from '../web-socket-relay-server/models/message';
import { WebSocketRelayClient } from '../web-socket-relay-server/web-socket-relay-client';
import { DataStore } from './data-store';
import { LogEntry } from './models/log-entry';

export class WebSocketRelayClientMessageHandler implements IMessageHandler {

    protected webSocketRelayClient: WebSocketRelayClient = null;

    constructor(
        protected dataStore: DataStore,
    ) {

    }

    public async handle(message: Message): Promise<any> {
        if (message.command === 'insert-log-entry') {
            const logEntry: LogEntry = message.payload;

            this.dataStore.insertLogEntry(logEntry);

            return 'OK';
        }

        if (message.command === 'request-log-entries') {
            return this.dataStore.getLogEntries();
        }
    }

    public setWebSocketRelayClient(webSocketRelayClient: WebSocketRelayClient): void {
        this.webSocketRelayClient = webSocketRelayClient;
    }

}
