# Mutex (Mutual Exclusion)

## Usage Example

```typescript
const mutex: Mutex = new Mutex();

await mutex.wait(); // Wait to acquire lock

// TODO: Excute synchronized code.

mutex.release();
```