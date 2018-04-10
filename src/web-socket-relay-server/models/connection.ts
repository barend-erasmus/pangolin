import * as WebSocket from 'ws';

export class Connection {

    constructor(
        public id: string,
        public metadata: any,
        public socket: WebSocket,
    ) {

    }

}
