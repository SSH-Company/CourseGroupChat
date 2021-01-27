import Websocket from 'websocket';
import amqp from 'amqplib';
import { config } from '../config/rabbitMq';

const connections = [];

class WSServer {
    private readonly wsServer;

    //all active clients
    private clients = {};

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
            connections.push(connection);

            // connection.on('message', function(message) {
            //     if (message.type === 'utf8') {
            //         console.log('Received Message: ' + message.utf8Data);
            //         connection.sendUTF(message.utf8Data);
            //     }
            //     else if (message.type === 'binary') {
            //         console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            //         connection.sendBytes(message.binaryData);
            //     }
            // });
            // connection.on('close', function(reasonCode, description) {
            //     console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            // });
        });
        this.consumeQueue() 
    }


    private sendMessage = (json) => {
        // We are sending the current data to all connected clients
        // Object.keys(this.clients).map((client) => {
        //     this.clients[client].sendUTF(json);
        // });
        connections[0].sendUTF(json);
    }

    public consumeQueue = async (queue = config.rabbit.queue, isNoAck = false, durable = false, prefetch = null) => {

        const cluster = await amqp.connect(config.rabbit.connectionString);
        const channel = await cluster.createChannel();
    
        await channel.assertQueue(queue, durable=durable);
    
        if (prefetch) {
            channel.prefetch(prefetch);
        }
    
        console.log(` [x] Waiting for messages in ${queue}. To exit press CTRL+C`)
       
        try {
            channel.consume(queue, message => {
            if (message !== null) {
                console.log(this.clients)
                console.log(' [x] Received', message.content.toString());
                channel.ack(message);
                this.sendMessage(message);
                return null;
            } else {
                console.log(message, 'Queue is empty!')
                channel.reject(message);
            }
        }, {noAck: isNoAck})
        } catch (error) {
            console.log(error, 'Failed to consume messages from Queue!')
            cluster.close(); 
        }
    }

    public originIsAllowed = (origin) => {
        // TODO: put logic here to detect whether the specified origin is allowed.
        return true;
    }

    // public static getSocket(): WSServer {
    //     if (!WSServer.instance) {
    //         WSServer.instance = new WSServer()
    //     }
    //     return WSServer.instance;
    // }
}

export default WSServer