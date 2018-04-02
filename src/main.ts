import * as crypto from 'crypto';
import { AlphaNumericCounter } from './alpha-numeric-counter';
import { DataStore } from './data-store';
import { HashProcessEvent } from './events/hash-process';
import { HashProcessCompletedEvent } from './events/hash-process-completed';
import { HashProcessCreatedEvent } from './events/hash-process-created';
import { HashProcessStartedEvent } from './events/hash-process-started';
import { HashProcess } from './models/hash-process';
import { Message } from './models/message';

let id: string = null;

let clientIds: string[] = [];

const ws = new WebSocket('ws://localhost:8891');

const dataStore: DataStore = new DataStore();

dataStore.addEvent(new HashProcessCreatedEvent('fC', 'D077F244DEF8A70E5EA758BD8352FCD8', dataStore.lamportTimestamp + 1, 'a'));

ws.onopen = () => {
    setTimeout(() => {
        ws.send(JSON.stringify(new Message('123456', null, null, 'set-key')));

        ws.send(JSON.stringify(new Message(null, null, null, 'list-clients')));

        setInterval(() => {
            execute(ws);
        }, 5000);
    }, 3000);
};

ws.onmessage = (event: MessageEvent) => {
    const message: Message = JSON.parse(event.data);

    if (message.type === 'list-clients') {
        clientIds = JSON.parse(message.data);
        id = message.to;
    } else if (message.type === 'client-opened') {
        ws.send(JSON.stringify(new Message(null, null, null, 'list-clients')));
    } else if (message.type === 'client-closed') {
        ws.send(JSON.stringify(new Message(null, null, null, 'list-clients')));
    } else {
        const hashProcessEvent: HashProcessEvent = JSON.parse(message.data);
        dataStore.addEvent(hashProcessEvent);
    }
};

ws.onclose = () => {

};

window.onbeforeunload = (event: BeforeUnloadEvent) => {
    ws.close();
};

function execute(client: WebSocket) {
    let hashProcess: HashProcess = dataStore.findExpiredHashProcess();

    if (!hashProcess) {
        hashProcess = dataStore.findUnprocessedHashProcess();

        if (!hashProcess) {
            hashProcess = dataStore.nextHashProcess();

            if (!hashProcess) {
                return;
            }

            const hashProcessCreatedEvent: HashProcessEvent = new HashProcessCreatedEvent(hashProcess.endValue, hashProcess.hash, dataStore.lamportTimestamp + 1, hashProcess.startValue);
            dataStore.addEvent(hashProcessCreatedEvent);
            client.send(JSON.stringify(new Message(JSON.stringify(hashProcessCreatedEvent), id, null, 'broadcast')));
        }
    }

    dataStore.lamportTimestamp++;

    hashProcess.inProgress = true;
    hashProcess.startTimestamp = dataStore.lamportTimestamp;

    const hashProcessStartedEvent: HashProcessEvent = new HashProcessStartedEvent(hashProcess.endValue, hashProcess.hash, dataStore.lamportTimestamp, hashProcess.startValue);
    dataStore.addEvent(hashProcessStartedEvent);
    client.send(JSON.stringify(new Message(JSON.stringify(hashProcessStartedEvent), id, null, 'broadcast')));

    const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(hashProcess.startValue);

    let found: boolean = false;

    while (true) {
        const str: string = alphaNumericCounter.value;

        const hash: string = crypto.createHash('md5').update(str).digest('hex');

        if (hash.toLowerCase() === hashProcess.hash.toLowerCase()) {
            hashProcess.completed = true;
            hashProcess.inProgress = false;
            hashProcess.result = str;

            const hashProcessCompletedEventWithResult: HashProcessEvent = new HashProcessCompletedEvent(hashProcess.endValue, hashProcess.hash, dataStore.lamportTimestamp + 1, hashProcess.result, hashProcess.startValue);
            dataStore.addEvent(hashProcessCompletedEventWithResult);
            client.send(JSON.stringify(new Message(JSON.stringify(hashProcessCompletedEventWithResult), id, null, 'broadcast')));

            found = true;

            console.log(`FOUND: '${hash}' -> '${str}'`);
        }

        if (str === hashProcess.endValue) {
            break;
        }

        alphaNumericCounter.incrementBy(1);
    }

    if (!found) {
        hashProcess.completed = true;
        hashProcess.inProgress = false;
        hashProcess.result = null;

        const hashProcessCompletedEventWithoutResult: HashProcessEvent = new HashProcessCompletedEvent(hashProcess.endValue, hashProcess.hash, dataStore.lamportTimestamp + 1, hashProcess.result, hashProcess.startValue);
        dataStore.addEvent(hashProcessCompletedEventWithoutResult);
        client.send(JSON.stringify(new Message(JSON.stringify(hashProcessCompletedEventWithoutResult), id, null, 'broadcast')));
    }

}
