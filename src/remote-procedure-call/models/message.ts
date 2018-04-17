export class Message {

    constructor(
        public command: string,
        public correlationId: string,
        public payload: any,
    ) {

    }

}
