export class Mutex {

    protected locked: boolean = false;

    constructor() {

    }

    public aquire(): boolean {
        if (!this.locked) {
            this.locked = true;
            return true;
        }

        return false;
    }

    public release(): void {
        this.locked = false;
    }

    public wait(): Promise<boolean> {
        return new Promise<boolean>((resolve: (result: boolean) => void, reject: (error: Error) => void) => {

            if (this.aquire()) {
                resolve(true);
                return;
            }

            const interval: NodeJS.Timer = setInterval(() => {
                if (this.aquire()) {
                    clearInterval(interval);
                    resolve(true);
                }
            }, 1);
        });
    }
}
