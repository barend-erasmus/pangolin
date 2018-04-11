export class LogEntry {

    constructor(
        public id: string,
        public payload: any,
        public type: string,
        public vectorClock: {},
    ) {

    }

}
