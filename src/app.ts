import { TwoPhaseSet } from './crdts/two-phase-set';

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
