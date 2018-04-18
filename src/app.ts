import { MultiValueRegister } from './crdts/multi-value-register';
import { VectorClock } from './vector-clock/vector-clock';

const vectorClock1: VectorClock = new VectorClock('1');
const multiValueRegister1: MultiValueRegister<string> = new MultiValueRegister<string>(vectorClock1);

const vectorClock2: VectorClock = new VectorClock('2');
const multiValueRegister2: MultiValueRegister<string> = new MultiValueRegister<string>(vectorClock2);

multiValueRegister1.set(vectorClock1.increment(), 'Hello');

multiValueRegister1.merge(multiValueRegister2);
multiValueRegister2.merge(multiValueRegister1);

multiValueRegister2.set(vectorClock2.increment(), 'World');

multiValueRegister1.merge(multiValueRegister2);
multiValueRegister2.merge(multiValueRegister1);

multiValueRegister1.set(vectorClock1.increment(), 'Foo');

multiValueRegister2.set(vectorClock2.increment(), 'Bar');

multiValueRegister1.merge(multiValueRegister2);
multiValueRegister2.merge(multiValueRegister1);

console.log(multiValueRegister1.get());
console.log(multiValueRegister2.get());
