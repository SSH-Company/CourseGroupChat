import amqp from 'amqplib';
import { Config } from './Config';

class Queue {
    private connection;
    private channel;

    constructor(name: string, connection: any) {
        this.connection = connection;
        this.consumeQueue(name);
    }

    private consumeQueue = async (queue = Config.getConfig().rabbit.queue, isNoAck = false, durable = false, prefetch = null) => {
    
        const config = Config.getConfig().rabbit;
        const cluster = await amqp.connect(config);
        const channel = await cluster.createChannel();
        this.channel = channel;
        await channel.assertQueue(queue, durable=durable);
    
        if (prefetch) {
            channel.prefetch(prefetch);
        }
    
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

            return () => { cluster.close(); }

        } catch (error) {
            console.log(error, 'Failed to consume messages from Queue!')
            cluster.close(); 
        }
    }

    //general function for publishing by queue name
    public publishToQueue = async (queue, message) => {
        try {
            await this.channel.sendToQueue(queue, Buffer.from(message));
        } catch (error) {
            // handle error response
            console.error(error, 'Unable to connect to cluster!');  
            process.exit(1);
        }
    }

    public closeChannel = async () => {
        try {
            await this.channel.close();
        } catch (error) {
            // handle error response
            console.error(error, 'Unable to close channel!');  
            process.exit(1);
        }
    }
}

export default Queue