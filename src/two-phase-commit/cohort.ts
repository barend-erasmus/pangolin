import { TwoPhaseCommit } from './two-phase-commit';

export class Cohort {

    protected entries: any[] = null;

    protected twoPhaseCommit: TwoPhaseCommit = null;

    constructor() {
        this.entries = [];
        this.twoPhaseCommit = new TwoPhaseCommit((payload: any) => this.onCommit(payload));
    }

    public abort(): void {
        this.twoPhaseCommit.abort();
    }

    public commit(): boolean {
        return this.twoPhaseCommit.commit();
    }

    public prepare(payload: any): boolean {
        return this.twoPhaseCommit.prepare(payload);
    }

    protected onCommit(payload: any): void {
        this.entries.push(payload);
    }

}
