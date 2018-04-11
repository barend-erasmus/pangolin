import { WebSocketRelayServer } from '../web-socket-relay-server/web-socket-relay-server';

(async () => {
    const webSocketRelayServer: WebSocketRelayServer = new WebSocketRelayServer(5001);

    webSocketRelayServer.listen();
})();
