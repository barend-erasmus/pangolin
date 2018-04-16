export class GrowOnlySet<T> {

    protected items: T[] = null;

    constructor() {
        this.items = [];
    }

    public add(item: T): GrowOnlySet<T> {
        this.items.push(item);

        return this;
    }

    public get(): T[] {
        return this.items.slice(0);
    }

    public merge(growOnlySet: GrowOnlySet<T>): GrowOnlySet<T> {
        for (const item of growOnlySet.get()) {
            if (this.items.indexOf(item) === -1) {
                this.items.push(item);
            }
        }

        return this;
    }
}
