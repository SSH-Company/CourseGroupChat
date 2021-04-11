import Websocket from 'websocket';
import Queue from './services/Queue';
import { Config } from './services/Config';
import amqp from 'amqplib';

export const CONNECTIONS = {};

class WSServer {
    private readonly wsServer;
    public cluster;

    constructor(server: any) {
        this.wsServer = new Websocket.server({ httpServer: server })
        this.setupBrokerConnection();
        
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
                    if (!(userID in CONNECTIONS)) {
                        //setup new connection
                        const queueName = `message-queue-${userID}`
                        CONNECTIONS[userID] = new Queue(queueName, this.cluster, connection)   
                    } else {
                        //reset connection
                        CONNECTIONS[userID].setConnection(connection);
                    }
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

    public setupBrokerConnection = async () => {
        try {
            const config = Config.getConfig().rabbit;
            this.cluster = await amqp.connect(config);
        } catch (err) {
            console.error(err, 'Unable to connect to broker service!');  
            process.exit(1);
        }
    }

    public originIsAllowed = (origin) => {
        // TODO: put logic here to detect whether the specified origin is allowed.
        return true;
    }
}

export default WSServer