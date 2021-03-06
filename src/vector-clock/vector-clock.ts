export class VectorClock {

    protected clock: {} = null;

    constructor(protected id: string) {
        this.clock = {};

        this.clock[this.id] = 0;
    }

    public static compare(clock1: {}, clock2: {}): number {
        const result: number[] = [];

        const clock1Keys: string[] = Object.keys(clock1);
        const clock2Keys: string[] = Object.keys(clock2);

        if (clock1Keys.length !== clock2Keys.length) {
            return clock1Keys.length - clock2Keys.length;
        }

        for (const key of clock1Keys) {
            result.push(clock1[key] - clock2[key]);
        }

        return result.filter((x) => x <= 0).length === result.length ? -1 : result.filter((x) => x > 0).length === result.length ? 1 : 0;
    }

    public get(): any {
        return JSON.parse(JSON.stringify(this.clock));
    }

    public increment(): any {
        this.clock[this.id]++;

        return this.get();
    }

    public merge(clock: {}): void {
        for (const key of Object.keys(clock)) {
            if (!this.clock[key]) {
                this.clock[key] = 0;
            }

            this.clock[key] = Math.max(this.clock[key], clock[key]);
        }
    }

}
