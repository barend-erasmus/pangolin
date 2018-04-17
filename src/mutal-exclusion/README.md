# Mutual Exclusion (Mutex)

"In computer science, mutual exclusion is a property of concurrency control, which is instituted for the purpose of preventing race conditions; it is the requirement that one thread of execution never enter its critical section at the same time that another concurrent thread of execution enters its own critical section." ~ [Wikipedia](https://en.wikipedia.org/wiki/Mutual_exclusion)

## Usage Example

```typescript
const mutex: Mutex = new Mutex();

await mutex.wait(); // Wait to acquire lock

// TODO: Enter Critical Section

mutex.release();
```