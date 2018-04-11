# Vector Clock

[Time and Ordering: Vector Clocks by University of Illinois](https://www.youtube.com/watch?v=jD4ECsieFbE)

## Usage Example

```typescript
const vectorClock1: VectorClock = new VectorClock('1');
const vectorClock2: VectorClock = new VectorClock('2');

const timestamp1 = vectorClock1.increment();
const timestamp2 = vectorClock2.increment();
const timestamp3 = vectorClock2.increment();
const timestamp4 = vectorClock1.increment();

vectorClock1.merge(vectorClock2.get());
vectorClock2.merge(vectorClock1.get());

const timestamps = [
    timestamp1,
    timestamp2,
    timestamp3,
    timestamp4,
];

timestamps.sort(VectorClock.compare);
```