import * as BigNumber from 'big-number';
import { HashRange } from './hash-range';
import { QueuedHashRange } from './queued-hash-range';

export class HashTask {

    protected completedRanges: HashRange[] = null;

    protected rangeSize: number = 3000;

    protected queuedRanges: QueuedHashRange[] = null;

    public answer: string = null;

    constructor(public result: string) {
        this.completedRanges = [];

        this.queuedRanges = [];
    }

    public addCompletedRange(range: HashRange): void {
        this.completedRanges.push(range);
    }

    public getNextRange(): HashRange {
        const expiredRange: QueuedHashRange = this.getExpiredRange();

        if (expiredRange) {
            return new HashRange(expiredRange.end, expiredRange.start);
        }

        let range: QueuedHashRange = null;

        if (this.completedRanges.length === 0) {
            range = new QueuedHashRange(this.rangeSize.toString(), '0', new Date());
        } else {
            const lastCompletedRange: HashRange = this.completedRanges[this.completedRanges.length - 1];

            range = new QueuedHashRange(BigNumber(lastCompletedRange.end).add(1).add(this.rangeSize).toString(), BigNumber(lastCompletedRange.end).add(1).toString(), new Date());
        }

        this.queuedRanges.push(range);

        return new HashRange(range.end, range.start);
    }

    public setAnswer(answer: string): void {
        this.answer = answer;
    }

    protected getExpiredRange(): QueuedHashRange {
        for (const range of this.queuedRanges) {
            if (range.timestamp.getTime() > new Date().getTime() + 30000) {
                range.timestamp = new Date();

                return range;
            }
        }

        return null;
    }

}
