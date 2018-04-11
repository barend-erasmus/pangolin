export class LamportTimestamp {

    protected clock: number = null;

    constructor() {
        this.clock = 0;
    }

    public static compare(clock1: number, clock2: number): number {
        return clock1 < clock2 ? -1 : clock1 > clock2 ? 1 : 0;
    }

    public get(): number {
        return this.clock;
    }

    public increment(): number {
        this.clock++;

        return this.get();
    }

    public merge(clock: number): void {
       this.clock = Math.max(this.clock, clock) + 1;
    }

}
