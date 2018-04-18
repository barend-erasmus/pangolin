import { VectorClock } from '../vector-clock/vector-clock';
import { MultiValueRegisterValue } from './multi-value-register-value';

export class MultiValueRegister<T> {

    protected multiValueRegisterValues: Array<MultiValueRegisterValue<T>> = null;

    constructor(protected vectorClock: VectorClock) {
        this.multiValueRegisterValues = [];
    }

    public get(): any[] {
        let previousClock: {} = {};
        let value: T[] = [];

        for (const multiValueRegisterValue of this.multiValueRegisterValues) {
            if (VectorClock.compare(multiValueRegisterValue.clock, previousClock) <= 0) {
                value.push(multiValueRegisterValue.value);
            } else if (VectorClock.compare(multiValueRegisterValue.clock, previousClock) > 0) {
                value = [multiValueRegisterValue.value];
            }

            previousClock = multiValueRegisterValue.clock;
        }

        return value;
    }

    public merge(multiValueRegister: MultiValueRegister<T>): void {
        for (const multiValueRegisterValue of multiValueRegister.multiValueRegisterValues) {
            if (!this.multiValueRegisterValues.find((x: MultiValueRegisterValue<T>) => x.value === multiValueRegisterValue.value)) {
                this.set(multiValueRegisterValue.clock, multiValueRegisterValue.value);
            }
        }
    }

    public set(clock: {}, value: T): MultiValueRegister<T> {
        const multiValueRegisterValue: MultiValueRegisterValue<T> = new MultiValueRegisterValue<T>(clock, value);

        this.multiValueRegisterValues.push(multiValueRegisterValue);

        this.multiValueRegisterValues = this.multiValueRegisterValues.sort((a: MultiValueRegisterValue<T>, b: MultiValueRegisterValue<T>) => VectorClock.compare(a.clock, b.clock));

        this.vectorClock.merge(clock);

        return this;
    }

}
