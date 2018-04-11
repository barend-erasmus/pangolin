export class HashAttempt {

    constructor(
        public end: string,
        public hashValue: string,
        public lastProcessedTimestamp: number,
        public processed: boolean,
        public result: string,
        public start: string,
    ) {

    }

    public expired(): boolean {
        return this.lastProcessedTimestamp + 20000 < new Date().getTime();
    }

}
