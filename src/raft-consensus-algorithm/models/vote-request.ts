export class VoteRequest {

    constructor(
        public candidateId: string,
        public lastLogIndex: number,
        public lastLogTerm: number,
        public term: number,
    ) {

    }

}
