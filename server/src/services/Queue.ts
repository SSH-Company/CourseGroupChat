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
            const channel = await cluster.createChannel();
            this.channel = {...channel};
            await channel.assertQueue(name, { durable: false });

            channel.consume(name, message => {
                if (message !== null) {
                    channel.ack(message);
                    this.connection.sendUTF(message.content)
                    return null;
                } else {
                    console.log(message, 'Queue is empty!')
                    channel.reject(message);
                }
            }, { noAck: false });

        } catch(err) {
            console.log(err);
            throw err;
        }
    }

    public publishToQueue = async (name, message) => {
        try {
            console.log(this.channel);
            await this.channel?.sendToQueue(name, Buffer.from(message));
        } catch (error) {
            // handle error response
            console.error(error, 'Unable to connect to cluster!');  
            process.exit(1);
        }
    }
}

export default Queue



