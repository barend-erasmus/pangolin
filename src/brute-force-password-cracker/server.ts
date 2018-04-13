import * as express from 'express';
import { WebSocketRelayServer } from '../web-socket-relay-server/web-socket-relay-server';

(async () => {
    const webSocketRelayServer: WebSocketRelayServer = new WebSocketRelayServer(5001);
    webSocketRelayServer.listen();

    const expressApplication: express.Application = express();

    expressApplication.use(express.static(__dirname));

    expressApplication.listen(5002);
})();
