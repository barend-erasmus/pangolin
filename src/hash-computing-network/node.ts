import * as BigNumber from 'big-number';
import { HashRange } from './hash-range';
import { HashTask } from './hash-task';
import { HashTaskRange } from './hash-task-range';

export class Node {

    protected workerProcesses: string[] = null;

    protected hashTasks: HashTask[] = null;

    constructor(
        protected sendHashTaskRange: (hashTaskRange: HashTaskRange, workerProcess: string) => void,
    ) {
        this.hashTasks = [
            new HashTask('5D41402ABC4B2A76B9719D911017C592'),
        ];
    }

    public addCompletedHashTaskRange(hashTaskRange: HashTaskRange, answer: string): void {
        for (const hashTask of this.hashTasks) {
            if (hashTask.result === hashTaskRange.result) {
                hashTask.addCompletedRange(new HashRange(hashTaskRange.end, hashTaskRange.start));

                hashTask.answer = answer;
            }
        }
    }

    public addWorkerProcess(workerProcess: string): void {
        this.workerProcesses.push(workerProcess);
    }

    public tick(): void {
        for (const workerProcess of this.workerProcesses) {
            const hashTaskRange: HashTaskRange = this.getNextHashTaskRange();

            if (hashTaskRange) {
                this.sendHashTaskRange(hashTaskRange, workerProcess);
            }
        }
    }

    protected getNextHashTaskRange(): HashTaskRange {
        for (const hashTask of this.hashTasks) {
            if (!hashTask.answer) {
                const range: HashRange = hashTask.getNextRange();

                return {
                    end: range.end,
                    result: hashTask.result,
                    start: range.start,
                };
            }
        }

        return null;
    }

}
