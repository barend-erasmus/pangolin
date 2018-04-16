import { GrowOnlySet } from './grow-only-set';

export class PNCounter {

    public decrementGrowOnlySet: GrowOnlySet<number> = null;

    public incrementGrowOnlySet: GrowOnlySet<number> = null;

    constructor() {
        this.decrementGrowOnlySet = new GrowOnlySet<number>();
        this.incrementGrowOnlySet = new GrowOnlySet<number>();
    }

    public decrement(value: number): PNCounter {
        this.decrementGrowOnlySet.add(value);

        return this;
    }

    public get(): number {
        const decrementSum: number = this.decrementGrowOnlySet.get().length === 0 ? 0 : this.decrementGrowOnlySet.get().reduce((a: number, b: number) => {
            return a + b;
        });

        const incrementSum: number = this.incrementGrowOnlySet.get().length === 0 ? 0 : this.incrementGrowOnlySet.get().reduce((a: number, b: number) => {
            return a + b;
        });

        return incrementSum - decrementSum;
    }

    public increment(value: number): PNCounter {
        this.incrementGrowOnlySet.add(value);

        return this;
    }

    public merge(pnCounter: PNCounter): PNCounter {
        this.decrementGrowOnlySet.merge(pnCounter.decrementGrowOnlySet);
        this.incrementGrowOnlySet.merge(pnCounter.incrementGrowOnlySet);

        return this;
    }

}
