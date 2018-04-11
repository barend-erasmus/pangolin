import { VectorClock } from './vector-clock/vector-clock';

const vectorClock1: VectorClock = new VectorClock('1');
const vectorClock2: VectorClock = new VectorClock('2');
const vectorClock3: VectorClock = new VectorClock('3');

function mergeAll(): void {
    vectorClock1.merge(vectorClock2.get());
    vectorClock1.merge(vectorClock3.get());

    vectorClock2.merge(vectorClock1.get());
    vectorClock2.merge(vectorClock3.get());

    vectorClock3.merge(vectorClock1.get());
    vectorClock3.merge(vectorClock2.get());
}

const eventA = {
    name: 'A',
    timestamp: vectorClock1.increment(),
};

mergeAll();

const eventB = {
    name: 'B',
    timestamp: vectorClock2.increment(),
};

// mergeAll();

const eventC = {
    name: 'C',
    timestamp: vectorClock1.increment(),
};

mergeAll();

const eventD = {
    name: 'D',
    timestamp: vectorClock1.increment(),
};

mergeAll();

let events: Array<{ name: string, timestamp: any }> = [
    eventA,
    eventB,
    eventC,
    eventD,
];

events = events.sort((a: { name: string, timestamp: any }, b: { name: string, timestamp: any }) => {
    return VectorClock.compare(a.timestamp, b.timestamp);
});

console.log(events);
