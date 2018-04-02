export class HashProcessEvent {

    constructor(
        public endValue: string,
        public hash: string,
        public lamportTimestamp: number,
        public startValue: string,
        public type: string,
    ) {

    }

}
