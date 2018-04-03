// import * as crypto from 'crypto';
// import { AlphaNumericCounter } from './alpha-numeric-counter';
// import { Client } from './client';
// import { DataStore } from './data-store';
// import { HashProcessEvent } from './events/hash-process';
// import { HashProcessCompletedEvent } from './events/hash-process-completed';
// import { HashProcessCreatedEvent } from './events/hash-process-created';
// import { HashProcessStartedEvent } from './events/hash-process-started';
// import { HashProcess } from './models/hash-process';
// import { Message } from './models/message';

// export class Main {

//     private client: Client = null;

//     private dataStore: DataStore = null;

//     constructor() {
//         this.client = new Client((message: Message) => this.onMessage(message), 'ws://localhost:8891');

//         this.dataStore = new DataStore();

//         // TODO: Remove
//         this.dataStore.addEvent(new HashProcessCreatedEvent('fC', 'D077F244DEF8A70E5EA758BD8352FCD8', this.dataStore.lamportTimestamp + 1, 'a'));

//         setInterval(() => {
//             this.onCycle();
//         }, 2500);
//     }

//     private onCycle(): void {
//         let hashProcess: HashProcess = this.dataStore.findExpiredHashProcess();

//         if (!hashProcess) {
//             hashProcess = this.dataStore.findUnprocessedHashProcess();

//             if (!hashProcess) {
//                 hashProcess = this.dataStore.nextHashProcess();

//                 if (!hashProcess) {
//                     return;
//                 }

//                 const hashProcessCreatedEvent: HashProcessEvent = new HashProcessCreatedEvent(hashProcess.endValue, hashProcess.hash, this.dataStore.lamportTimestamp + 1, hashProcess.startValue);
//                 this.dataStore.addEvent(hashProcessCreatedEvent);
//                 this.client.sendHashProcessEventBroadcast(hashProcessCreatedEvent);
//             }
//         }

//         this.dataStore.lamportTimestamp++;

//         hashProcess.inProgress = true;
//         hashProcess.startTimestamp = this.dataStore.lamportTimestamp;

//         const hashProcessStartedEvent: HashProcessEvent = new HashProcessStartedEvent(hashProcess.endValue, hashProcess.hash, this.dataStore.lamportTimestamp, hashProcess.startValue);
//         this.dataStore.addEvent(hashProcessStartedEvent);
//         this.client.sendHashProcessEventBroadcast(hashProcessStartedEvent);

//         const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(hashProcess.startValue);

//         let found: boolean = false;

//         while (true) {
//             const str: string = alphaNumericCounter.value;

//             const hash: string = crypto.createHash('md5').update(str).digest('hex');

//             if (hash.toLowerCase() === hashProcess.hash.toLowerCase()) {
//                 hashProcess.completed = true;
//                 hashProcess.inProgress = false;
//                 hashProcess.result = str;

//                 const hashProcessCompletedEventWithResult: HashProcessEvent = new HashProcessCompletedEvent(hashProcess.endValue, hashProcess.hash, this.dataStore.lamportTimestamp + 1, hashProcess.result, hashProcess.startValue);
//                 this.dataStore.addEvent(hashProcessCompletedEventWithResult);
//                 this.client.sendHashProcessEventBroadcast(hashProcessCompletedEventWithResult);

//                 found = true;

//                 console.log(`FOUND: '${hash}' -> '${str}'`);
//                 postMessage(`FOUND: '${hash}' -> '${str}'`, null);
//             }

//             if (str === hashProcess.endValue) {
//                 break;
//             }

//             alphaNumericCounter.incrementBy(1);
//         }

//         if (!found) {
//             hashProcess.completed = true;
//             hashProcess.inProgress = false;
//             hashProcess.result = null;

//             const hashProcessCompletedEventWithoutResult: HashProcessEvent = new HashProcessCompletedEvent(hashProcess.endValue, hashProcess.hash, this.dataStore.lamportTimestamp + 1, hashProcess.result, hashProcess.startValue);
//             this.dataStore.addEvent(hashProcessCompletedEventWithoutResult);
//             this.client.sendHashProcessEventBroadcast(hashProcessCompletedEventWithoutResult);
//         }
//     }

//     private onMessage(message: Message): void {
//         const messagePayload: MessagePayload = message.data;

//         if (message.type === 'hash-process-event') {
//             const hashProcessEvent: HashProcessEvent = messagePayload.data;
//             this.dataStore.addEvent(hashProcessEvent);
//         }
//     }

// }

// const main: Main = new Main();
