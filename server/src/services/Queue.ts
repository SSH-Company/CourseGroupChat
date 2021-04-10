import amqp from 'amqplib';
import { Config } from './Config';

class Queue {
    public connection;
    public channel;

    constructor(exchange: string, connection: any) {  
        //setup
        this.connection = connection;
        this.consumeQueue(exchange);
    }

    private consumeQueue = async (name) => {
        try {
            const config = Config.getConfig().rabbit;
            const cluster = await amqp.connect(config);
            this.channel = await cluster.createChannel();
            
            await this.channel.assertQueue(name, { durable: false });

            this.channel.consume(name, message => {
                if (message !== null) {
                    this.channel.ack(message);
                    this.connection.sendUTF(message.content)
                    return null;
                } else {
                    console.log(message, 'Queue is empty!')
                    this.channel.reject(message);
                }
            }, { noAck: false });

        } catch(err) {
            console.log(err);
            throw err;
        }
    }

    public publishToQueue = async (name, message) => {
        try {
            await this.channel?.sendToQueue(name, Buffer.from(message));
        } catch (error) {
            // handle error response
            console.error(error, 'Unable to connect to cluster!');  
            process.exit(1);
        }
    }
}

export default Queue



