export class HashProcessEvent {

    constructor(
        public endValue: string,
        public hash: string,
        public index: number,
        public startValue: string,
        public type: string,
    ) {

    }

}
