# Conflict-Free Replicated Data Types

"In distributed computing, a conflict-free replicated data type (CRDT) is a data structure which can be replicated across multiple computers in a network, where the replicas can be updated independently and concurrently without coordination between the replicas, and where it is always mathematically possible to resolve inconsistencies which might result." ~ [Wikipedia](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)

* [Experimental CRDT-implementations for the JVM](https://github.com/netopyr/wurmloch-crdt)

## Grow-Only Set

A grow-only set is a set which only allows adds. Once an element is added , it cannot be removed. A union is performed to merge two or more grow-only sets.

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

## Positive-Negative Counter

A PN Counter uses two G-Counters (Grow-Only Counter) to allow for increment and decrement operations.

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

## 2-Phase Set

Two Grow-Only Sets can be combined to create a 2-Phase Set. One G-Set will be used for adding items and the other to remove items.

```typescript
const twoPhaseSet1: TwoPhaseSet<string> = new TwoPhaseSet<string>();
const twoPhaseSet2: TwoPhaseSet<string> = new TwoPhaseSet<string>();

twoPhaseSet1.add('hello');
twoPhaseSet1.add('world');

twoPhaseSet2.add('foo');
twoPhaseSet2.add('bar');

twoPhaseSet1.remove('foo');
twoPhaseSet2.remove('world');

twoPhaseSet1.merge(twoPhaseSet2);
twoPhaseSet2.merge(twoPhaseSet1);

console.log(twoPhaseSet1.get()); // [ 'hello', 'bar' ]
console.log(twoPhaseSet2.get()); // [ 'bar', 'hello' ]
```

## More

* Last-Writer-Wins Register (LWW-Register)
* Multi-Value Register (MV-Register)
* Observed-Removed Set (OR-Set)
* Replicated Growable Array (RGA)
* Max-Change-Set (MC-Set)