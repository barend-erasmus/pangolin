import { Cohort } from './two-phase-commit/cohort';
import { Coordinator } from './two-phase-commit/coordinator';

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
