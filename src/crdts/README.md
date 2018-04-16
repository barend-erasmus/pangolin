# Confict-Free Replicated Data Types

* [wurmloch-crdt (Experimental CRDT-implementations for the JVM)](https://github.com/netopyr/wurmloch-crdt)

## Grow-Only Set

* Element can also be added and *never* removed.

### Usage Example

```typescript
const growOnlySet1: GrowOnlySet<string> = new GrowOnlySet<string>();
const growOnlySet2: GrowOnlySet<string> = new GrowOnlySet<string>();

growOnlySet1.add('hello');
growOnlySet2.add('world');

growOnlySet1.merge(growOnlySet2);
growOnlySet2.merge(growOnlySet1);

console.log(growOnlySet1.get()); // [ 'hello', 'world' ]
console.log(growOnlySet2.get()); // [ 'world', 'hello' ]
```

## PN Counter

### Usage Example

```typescript
const pnCounter1: PNCounter = new PNCounter();
const pnCounter2: PNCounter = new PNCounter();

pnCounter1.increment(5);
pnCounter2.decrement(3);
pnCounter1.increment(10);
pnCounter1.increment(3);
pnCounter2.increment(6);
pnCounter2.increment(9);

pnCounter1.merge(pnCounter2);
pnCounter2.merge(pnCounter1);

console.log(pnCounter1.get()); // 30
console.log(pnCounter2.get()); // 30
```

## 2-Phase Set (2P-Set)


## Last-Writer-Wins Register (LWW-Register)

## Multi-Value Register (MV-Register)

## Observed-Remove Set (OR-Set)

## Replicated Growable Array (RGA)

## 