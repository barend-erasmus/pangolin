# Two-Phase Commit

"In transaction processing, databases, and computer networking, the two-phase commit protocol (2PC) is a type of atomic commitment protocol (ACP). It is a distributed algorithm that coordinates all the processes that participate in a distributed atomic transaction on whether to commit or abort (roll back) the transaction (it is a specialized type of consensus protocol)." ~ [Wikipedia](https://en.wikipedia.org/wiki/Two-phase_commit_protocol)

## Flow Diagram

![](https://github.com/barend-erasmus/pangolin/raw/master/images/two-phase-commit.png)

## Usage Example

```typescript
const cohort1: Cohort = new Cohort();
const cohort2: Cohort = new Cohort();
const cohort3: Cohort = new Cohort();

const coordinator: Coordinator = new Coordinator([
    cohort1,
    cohort2,
    cohort3,
]);

coordinator.write('hello world');

console.log(coordinator.read()); // [ 'hello world' ]
```