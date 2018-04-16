import { GrowOnlySet } from './grow-only-set';

export class TwoPhaseSet<T> {

    public addGrowOnlySet: GrowOnlySet<T> = null;

    public removeGrowOnlySet: GrowOnlySet<T> = null;

    constructor() {
        this.addGrowOnlySet = new GrowOnlySet<T>();
        this.removeGrowOnlySet = new GrowOnlySet<T>();
    }

    public add(item: T): TwoPhaseSet<T> {
        this.addGrowOnlySet.add(item);

        return this;
    }

    public get(): T[] {
        const result: T[] = this.addGrowOnlySet.get();

        for (const item of this.removeGrowOnlySet.get()) {
            const index: number = result.indexOf(item);

            if (index > -1) {
                result.splice(index, 1);
            }
        }

        return result;
    }

    public merge(twoPhaseSet: TwoPhaseSet<T>): TwoPhaseSet<T> {
        this.addGrowOnlySet.merge(twoPhaseSet.addGrowOnlySet);
        this.removeGrowOnlySet.merge(twoPhaseSet.removeGrowOnlySet);

        return this;
    }

    public remove(item: T): TwoPhaseSet<T> {
        this.removeGrowOnlySet.add(item);

        return this;
    }

}
