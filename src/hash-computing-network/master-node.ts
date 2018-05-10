import { HashRange } from './hash-range';
import { HashTask } from './hash-task';
import { HashTaskRange } from './hash-task-range';
import { WorkerProcess } from './worker-process';

export class MasterNode {

    protected workerProcesses: WorkerProcess[] = null;

    protected hashTasks: HashTask[] = null;

    constructor(
        protected hashRangeExpiry: number,
        protected hashRangeSize: number,
        protected onHashTaskSolved: (answer: string, result: string) => void,
        protected sendHashTaskRange: (hashTaskRange: HashTaskRange, workerProcessId: string) => void,
        protected workerProcessExpiry: number,
    ) {
        this.workerProcesses = [];

        this.hashTasks = [
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, 'D077F244DEF8A70E5EA758BD8352FCD8'), // 'cat'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, '06D80EB0C50B49A509B49F2424E8C805'), // 'dog'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, '9DFD70FDF15A3CB1EA00D7799AC6651B'), // 'bee'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, 'E756F6AAFAFDEF4DEBDB5E49BCBD3F11'), // 'rat'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, '81566E986CF8CC685A05AC5B634AF7F8'), // 'cow'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, 'ABAECF8CA3F98DC13EEECBAC263CD3ED'), // 'bird'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, '893B56E3CFE153FB770A120B83BAC20C'), // 'bear'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, '6B42D00C4CA6DDC33A604C54B8CE4ADC'), // 'lion'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, 'BF4397D8B4DC061E1B6D191A352E9134'), // 'wolf'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, 'F1BDF5ED1D7AD7EDE4E3809BD35644B0'), // 'horse'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, '1EBFD5913EF450B92B9E65B6DE09ACAD'), // 'whale'
            new HashTask(this.hashRangeExpiry, this.hashRangeSize, '9C281A0EF81E257407FE01FA6AA0FA73'), // 'hello'
        ];
    }

    public addCompletedHashTaskRange(hashTaskRange: HashTaskRange, answer: string): void {
        for (const hashTask of this.hashTasks) {
            if (hashTask.result.toLowerCase() === hashTaskRange.result.toLowerCase()) {
                hashTask.addCompletedHashRange(new HashRange(hashTaskRange.end, hashTaskRange.start));

                if (!hashTask.answer) {
                    hashTask.answer = answer;

                    if (hashTask.answer && this.onHashTaskSolved) {
                        this.onHashTaskSolved(hashTask.answer, hashTask.result);
                    }
                }
            }
        }
    }

    public addWorkerProcess(workerProcessId: string): boolean {
        const existingWorkerProcess: WorkerProcess = this.workerProcesses.find((workerProcess: WorkerProcess) => workerProcess.id === workerProcessId);

        if (existingWorkerProcess) {
            existingWorkerProcess.joinCommandTimestamp = new Date();

            return false;
        }

        this.workerProcesses.push(new WorkerProcess(workerProcessId, new Date()));

        return true;

    }

    public tick(): void {
        this.workerProcesses = this.workerProcesses.filter((workerProcess: WorkerProcess) => workerProcess.joinCommandTimestamp.getTime() > new Date().getTime() - this.workerProcessExpiry);

        for (const workerProcess of this.workerProcesses) {
            const hashTaskRange: HashTaskRange = this.getNextHashTaskRange();

            if (hashTaskRange && this.sendHashTaskRange) {
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
