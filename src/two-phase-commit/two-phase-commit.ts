import { Mutex } from '../mutex/mutex';

export class TwoPhaseCommit {

    protected buffer: any = null;

    protected mutex: Mutex = new Mutex();

    constructor(protected onCommit: (payload: any) => void) {
    }

    public abort(): void {
        this.buffer = null;
        this.mutex.release();
    }

    public commit(): boolean {
        this.onCommit(this.buffer);
        this.mutex.release();

        return true;
    }

    public prepare(payload: any): boolean {
        if (this.mutex.aquire()) {
            this.buffer = payload;

            return true;
        }

        return false;
    }

    public async prepareWait(payload: any): Promise<boolean> {
        await this.mutex.wait();

        this.buffer = payload;

        return true;
    }

}
