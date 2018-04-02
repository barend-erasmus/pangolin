export class HashProcess {

    constructor(
        public completed: boolean,
        public completedTimestamp: number,
        public createdTimestamp: number,
        public endValue: string,
        public hash: string,
        public inProgress: boolean,
        public result: string,
        public startTimestamp: number,
        public startValue: string,
    ) {

    }

}
