export class Message {

    constructor(
        public command: string,
        public correlationId: string,
        public from: string,
        public payload: any,
        public to: string,
    ) {

    }

}
