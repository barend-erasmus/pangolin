export class AppendEntriesResponse {

    constructor(
        public conflictIndex: number,
        public conflictTerm: number,
        public success: boolean,
        public term: number,
    ) {

    }

}
