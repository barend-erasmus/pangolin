import { PNCounter } from './crdts/pn-counter';

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

console.log(pnCounter1.get());
console.log(pnCounter2.get());
