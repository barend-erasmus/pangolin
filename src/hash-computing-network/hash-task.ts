import * as BigNumber from 'big-number';
import { HashRange } from './hash-range';
import { QueuedHashRange } from './queued-hash-range';

export class HashTask {

    public answer: string = null;

    protected completedHashRanges: HashRange[] = null;

    protected hashRangeExpiry: number = 3000;

    protected hashRangeSize: number = 10000;

    protected queuedHashRanges: QueuedHashRange[] = null;

    constructor(public result: string) {
        this.completedHashRanges = [];

        this.queuedHashRanges = [];
    }

    public addCompletedHashRange(hashRange: HashRange): void {
        this.completedHashRanges.push(hashRange);

        const queuedHashRange: QueuedHashRange = this.queuedHashRanges.find((x: QueuedHashRange) => x.end === hashRange.end && x.start === hashRange.start);

        if (queuedHashRange) {
            const index: number = this.queuedHashRanges.indexOf(queuedHashRange);

            if (index > -1) {
                this.queuedHashRanges.splice(index, 1);
            }
        }
    }

    public getNextHashRange(): HashRange {
        const expiredHashRange: QueuedHashRange = this.getExpiredHashRange();

        if (expiredHashRange) {
            return new HashRange(expiredHashRange.end, expiredHashRange.start);
        }

        let hashRange: QueuedHashRange = null;

        if (this.queuedHashRanges.length === 0) {
            if (this.completedHashRanges.length === 0) {
                hashRange = new QueuedHashRange(this.hashRangeSize.toString(), '0', new Date());
            } else {
                const lastCompletedHashRange: HashRange = this.completedHashRanges[this.completedHashRanges.length - 1];

                hashRange = new QueuedHashRange(BigNumber(lastCompletedHashRange.end).add(1).add(this.hashRangeSize).toString(), BigNumber(lastCompletedHashRange.end).add(1).toString(), new Date());
            }
        } else {
            const lastQueuedHashRange: HashRange = this.queuedHashRanges[this.queuedHashRanges.length - 1];

            hashRange = new QueuedHashRange(BigNumber(lastQueuedHashRange.end).add(1).add(this.hashRangeSize).toString(), BigNumber(lastQueuedHashRange.end).add(1).toString(), new Date());
        }

        this.queuedHashRanges.push(hashRange);

        return new HashRange(hashRange.end, hashRange.start);
    }

    public setAnswer(answer: string): void {
        this.answer = answer;
    }

    protected getExpiredHashRange(): QueuedHashRange {
        for (const hashRange of this.queuedHashRanges) {
            if (hashRange.timestamp.getTime() + this.hashRangeExpiry < new Date().getTime()) {
                hashRange.timestamp = new Date();

                return hashRange;
            }
        }

        return null;
    }

}
