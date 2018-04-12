import * as BigNumber from 'big-number';
import { HashAttempt } from './hash-attempt';

export class Hash {

    constructor(
        public attempts: HashAttempt[],
        public value: string,
    ) {

    }

    public getExpiredAttempt(): HashAttempt {
        for (const attempt of this.attempts) {
            if (!attempt.processed && attempt.expired()) {
                return attempt;
            }
        }

        return null;
    }

    public solved(): boolean {
        for (const attempt of this.attempts) {
            if (attempt.processed && attempt.result) {
                return true;
            }
        }

        return false;
    }

    public findMaximumEnd(): string {
        let maximum: BigNumber = BigNumber(-1);

        for (const attempt of this.attempts) {
            const end: BigNumber = BigNumber(attempt.end);

            if (end.gt(maximum)) {
                maximum = end;
            }
        }

        return maximum.toString();
    }

}
