# Lamport Timestamp

"The algorithm of Lamport timestamps is a simple algorithm used to determine the order of events in a distributed computer system." ~ [Wikipedia](https://en.wikipedia.org/wiki/Lamport_timestamps)

[Time and Ordering: Lamport Timestamps by University of Illinois](https://www.youtube.com/watch?v=CMBjvCzDVkY)

* A process increments its counter before each event is that process.
* When a process sends a message, it includes its counter value with the message.
* On receiving a message, the counter of the recipient is updated, if necessary, to the greater of its current counter and the timestamp in the received message. The counter is then incremented by 1 before the message is considered received.

![](https://github.com/barend-erasmus/pangolin/raw/master/images/lamport-timestamp.png)

## Usage Example

```typescript
const lamportTimestamp1: LamportTimestamp = new LamportTimestamp();
const lamportTimestamp2: LamportTimestamp = new LamportTimestamp();

const timestamp1: number = lamportTimestamp1.increment();
const timestamp2: number = lamportTimestamp2.increment();
const timestamp3: number = lamportTimestamp2.increment();
const timestamp4: number = lamportTimestamp1.increment();

lamportTimestamp1.merge(lamportTimestamp2.get());
lamportTimestamp2.merge(lamportTimestamp1.get());

const timestamps: number[] = [
    timestamp1,
    timestamp2,
    timestamp3,
    timestamp4,
];

timestamps.sort(LamportTimestamp.compare);
```