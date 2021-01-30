import Websocket from 'websocket';
import Queue from './services/Queue';

const connections = {};

class WSServer {
    private readonly wsServer;

    constructor(server: any) {
        this.wsServer = new Websocket.server({ httpServer: server })
        this.wsServer.on('request', function(request) {
            // if (!this.originIsAllowed(request.origin)) {
            //   // Make sure we only accept requests from an allowed origin
            //   request.reject();
            //   console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            //   return;
            // }
            
            var connection = request.accept('', request.origin);
            console.log((new Date()) + ' Connection accepted.');
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    const userID = JSON.parse(message.utf8Data).userID
                    const queueName = `message-queue${userID}`
                    connections[userID] = new Queue(queueName, connection)
                }
                else if (message.type === 'binary') {
                    console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                    connection.sendBytes(message.binaryData);
                }
            });
            connection.on('close', function(reasonCode, description) {
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        }); 
    }

    public originIsAllowed = (origin) => {
        // TODO: put logic here to detect whether the specified origin is allowed.
        return true;
    }
}

export default WSServer