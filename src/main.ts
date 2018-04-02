import * as crypto from 'crypto';
import { AlphaNumericCounter } from './alpha-numeric-counter';
import { DataStore } from './data-store';
import { HashProcessResult } from './models/hash-process-result';
import { LogEntry } from './models/log-entry';

import { Message } from './models/message';

let thisId: string = null;

let clientIds: string[] = [];

const ws = new WebSocket('ws://localhost:8891');

const dataStore: DataStore = new DataStore();

dataStore.addLogEntry(new LogEntry(new HashProcessResult(false, 'fC', 'ACBD18DB4CC2F85CEDEF654FCCC4A4D8', false, null, null, 'a'), dataStore.lamportTimestamp + 1));

ws.onopen = () => {
    setTimeout(() => {
        ws.send(JSON.stringify(new Message('123456', null, null, 'set-key')));

        ws.send(JSON.stringify(new Message(null, null, null, 'list-clients')));
    }, 3000);
};

ws.onmessage = (event: MessageEvent) => {
    const message: Message = JSON.parse(event.data);

    if (message.type === 'list-clients') {
        clientIds = JSON.parse(message.data);
        thisId = message.to;

    } else if (message.type === 'client-opened') {
        ws.send(JSON.stringify(new Message(null, null, null, 'list-clients')));
    } else if (message.type === 'client-closed') {
        ws.send(JSON.stringify(new Message(null, null, null, 'list-clients')));
    } else {

    }
};

ws.onclose = () => {

};

window.onbeforeunload = (event: BeforeUnloadEvent) => {
    ws.close();
};

function execute(client: WebSocket) {
    let hashProcessResult: HashProcessResult = dataStore.findExpiredHashProcessResult();

    if (!hashProcessResult) {
        hashProcessResult = dataStore.findUnprocessedHashProcessResult();

        if (!hashProcessResult) {
            hashProcessResult = dataStore.nextHashProcessResult();
        }
    }

    dataStore.lamportTimestamp++;

    hashProcessResult.inProgress = true;
    hashProcessResult.startTimestamp = dataStore.lamportTimestamp;

    client.send(JSON.stringify(new Message(JSON.stringify(new LogEntry(hashProcessResult, dataStore.lamportTimestamp)), thisId, null, 'broadcast')));

    const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(hashProcessResult.startValue);

    while (true) {
        const str: string = alphaNumericCounter.value;

        const hash: string = crypto.createHash('md5').update(str).digest('hex');

        if (hash === hashProcessResult.hash) {
            hashProcessResult.completed = true;
            hashProcessResult.inProgress = false;
            hashProcessResult.result = str;

            client.send(JSON.stringify(new Message(JSON.stringify(new LogEntry(hashProcessResult, dataStore.lamportTimestamp)), thisId, null, 'broadcast')));
        }

        if (str === hashProcessResult.endValue) {
            break;
        }

        alphaNumericCounter.incrementBy(1);
    }

    hashProcessResult.inProgress = false;

    client.send(JSON.stringify(new Message(JSON.stringify(new LogEntry(hashProcessResult, dataStore.lamportTimestamp)), thisId, null, 'broadcast')));
}
