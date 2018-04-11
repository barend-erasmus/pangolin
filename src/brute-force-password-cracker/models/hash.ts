import { HashAttempt } from './hash-attempt';

export class Hash {

    constructor(
        public attempts: HashAttempt[],
        public value: string,
    ) {

    }

    public getExpiredAttempt(): HashAttempt {
        for (const attempt of this.attempts) {
            if (attempt.expired()) {
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

}
