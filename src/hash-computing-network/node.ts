import * as BigNumber from 'big-number';
import { IHashAlgorithm, MD5 } from 'majuro';
import { BigNumberHelper } from './big-number-helper';
import { HashRange } from './hash-range';
import { HashTask } from './hash-task';
import { HashTaskRange } from './hash-task-range';
import { WorkerProcess } from './worker-process';

export class Node {

    protected workerProcesses: WorkerProcess[] = null;

    protected workerProcessExpiry: number = 40000;

    protected hashTasks: HashTask[] = null;

    constructor(
        protected sendHashTaskRange: (hashTaskRange: HashTaskRange, workerProcessId: string) => void,
    ) {
        this.workerProcesses = [];

        this.hashTasks = [
            new HashTask('D077F244DEF8A70E5EA758BD8352FCD8'), // 'cat'
            new HashTask('06D80EB0C50B49A509B49F2424E8C805'), // 'dog'
            new HashTask('9DFD70FDF15A3CB1EA00D7799AC6651B'), // 'bee'
            new HashTask('E756F6AAFAFDEF4DEBDB5E49BCBD3F11'), // 'rat'
            new HashTask('81566E986CF8CC685A05AC5B634AF7F8'), // 'cow'
            new HashTask('ABAECF8CA3F98DC13EEECBAC263CD3ED'), // 'bird'
        ];
    }

    public addCompletedHashTaskRange(hashTaskRange: HashTaskRange, answer: string): void {
        for (const hashTask of this.hashTasks) {
            if (hashTask.result.toLowerCase() === hashTaskRange.result.toLowerCase()) {
                hashTask.addCompletedHashRange(new HashRange(hashTaskRange.end, hashTaskRange.start));

                if (!hashTask.answer) {
                    hashTask.answer = answer;
                }
            }
        }
    }

    public computeHashTaskRange(hashTaskRange: HashTaskRange): string {
        const hashAlgorithm: IHashAlgorithm = new MD5();

        let value: BigNumber = BigNumber(hashTaskRange.start);

        const endValue: BigNumber = BigNumber(hashTaskRange.end);

        while (value.lte(endValue)) {
            const str: string = BigNumberHelper.toString(value, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split(''));

            if (hashAlgorithm.calculate(str).toLowerCase() === hashTaskRange.result.toLowerCase()) {
                return str;
            }

            value = value.add(1);
        }

        return null;
    }

    public addWorkerProcess(workerProcessId: string): void {
        const existingWorkerProcess: WorkerProcess = this.workerProcesses.find((workerProcess: WorkerProcess) => workerProcess.id === workerProcessId);

        if (existingWorkerProcess) {
            existingWorkerProcess.joinCommandTimestamp = new Date();
        } else {
            this.workerProcesses.push(new WorkerProcess(workerProcessId, new Date()));
        }
    }

    public tick(): void {
        this.workerProcesses = this.workerProcesses.filter((workerProcess: WorkerProcess) => workerProcess.joinCommandTimestamp.getTime() > new Date().getTime() - this.workerProcessExpiry);

        for (const workerProcess of this.workerProcesses) {
            const hashTaskRange: HashTaskRange = this.getNextHashTaskRange();

            if (hashTaskRange) {
                this.sendHashTaskRange(hashTaskRange, workerProcess.id);
            }
        }
    }

    protected getNextHashTaskRange(): HashTaskRange {
        for (const hashTask of this.hashTasks) {
            if (!hashTask.answer) {
                const hashRange: HashRange = hashTask.getNextHashRange();

                return new HashTaskRange(hashRange.end, hashTask.result, hashRange.start);
            }
        }

        return null;
    }

}
