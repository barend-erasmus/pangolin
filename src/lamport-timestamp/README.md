# Lamport Timestamp

[Time and Ordering: Lamport Timestamps by University of Illinois](https://www.youtube.com/watch?v=CMBjvCzDVkY)

## Usage Example

```typescript
const lamportTimestamp1: LamportTimestamp = new LamportTimestamp();
const lamportTimestamp2: LamportTimestamp = new LamportTimestamp();

const timestamp1 = lamportTimestamp1.increment();
const timestamp2 = lamportTimestamp2.increment();
const timestamp3 = lamportTimestamp2.increment();
const timestamp4 = lamportTimestamp1.increment();

lamportTimestamp1.merge(lamportTimestamp2.get());
lamportTimestamp2.merge(lamportTimestamp1.get());

const timestamps = [
    timestamp1,
    timestamp2,
    timestamp3,
    timestamp4,
];

timestamps.sort(LamportTimestamp.compare);
```