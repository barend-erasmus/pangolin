import { Cohort } from './cohort';
import { TwoPhaseCommit } from './two-phase-commit';

export class Coordinator {

    protected entries: any[] = null;

    protected twoPhaseCommit: TwoPhaseCommit = null;

    constructor(
        protected cohorts: Cohort[],
    ) {
        this.entries = [];
        this.twoPhaseCommit = new TwoPhaseCommit((payload: any) => this.onCommit(payload));
    }

    public read(): any[] {
        return this.entries.slice(0);
    }

    public write(payload: any): boolean {
        if (!this.prepare(payload)) {
            return false;
        }

        if (this.prepareCohorts(payload)) {
            if (this.commitCohorts()) {
                this.commit();
            } else {
                this.abortCohorts();
                this.abort();
            }
        } else {
            this.abortCohorts();
            this.abort();
        }
    }

    protected abort(): void {
        this.twoPhaseCommit.abort();
    }

    protected abortCohorts(): void {
        for (const cohort of this.cohorts) {
            cohort.abort();
        }
    }

    protected commit(): boolean {
        return this.twoPhaseCommit.commit();
    }

    protected commitCohorts(): boolean {
        for (const cohort of this.cohorts) {
            if (!cohort.commit()) {
                return false;
            }
        }

        return true;
    }

    protected prepare(payload: any): boolean {
        return this.twoPhaseCommit.prepare(payload);
    }

    protected prepareCohorts(payload: any): boolean {
        for (const cohort of this.cohorts) {
            if (!cohort.prepare(payload)) {
                return false;
            }
        }

        return true;
    }

    protected onCommit(payload: any): void {
        this.entries.push(payload);
    }
}
