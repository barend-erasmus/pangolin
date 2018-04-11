export class LogEntry {

    constructor(
        public id: number,
        public payload: any,
        public type: string,
        public vectorClock: {},
    ) {

    }

}
