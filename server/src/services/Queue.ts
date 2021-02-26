import amqp from 'amqplib';
import { config } from '../../config/rabbitMq'

class Queue {
    private connection;

    constructor(name: string, connection: any) {
        this.connection = connection;
        this.consumeQueue(name);
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
                this.connection.sendUTF(message.content)
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

//general function for publishing by queue name
export const publishToQueue = async (queue, message, durable = false) => {
    try {
        const cluster = await amqp.connect(config.rabbit.connectionString);
        const channel = await cluster.createChannel();

        await channel.assertQueue(queue, durable= durable);
        await channel.sendToQueue(queue, Buffer.from(message));
      
        console.info(' [x] Sending message to queue', queue, message);
            
    } catch (error) {
        // handle error response
        console.error(error, 'Unable to connect to cluster!');  
        process.exit(1);
    }
}

export default Queue