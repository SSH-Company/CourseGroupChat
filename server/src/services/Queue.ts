import amqp from 'amqplib';
import { config } from '../../config/rabbitMq'

class Queue {
    private connection;

    constructor(name: string, connection: any) {
        this.connection = connection;
        this.consumeQueue(name);
    }

    private sendMessage = (json) => {
        // const messageContent = JSON.parse(json.content.toString())
        this.connection.sendUTF(json.content)
        // const recipientID = messageContent.recipientID
        // if (recipientID.id in connections) {
        //     connections[recipientID.id].sendUTF(json.content);
        // }
    }
    
    private consumeQueue = async (queue = config.rabbit.queue, isNoAck = false, durable = false, prefetch = null) => {
    
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
}

export default Queue