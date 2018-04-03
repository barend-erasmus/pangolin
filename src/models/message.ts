export class Message {

    constructor(
        public command: string,
        public correlationId: string,
        public data: any,
        public from: string,
        public to: string,
    ) {

    }

}
