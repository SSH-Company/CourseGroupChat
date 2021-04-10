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

    private consumeQueue = async (exchange) => {
        try {
            const config = Config.getConfig().rabbit;
            const cluster = await amqp.connect(config);
            this.channel = await cluster.createChannel();
            console.log(this.channel);
            this.channel.assertExchange(exchange, 'fanout', {
                durable: false
            });

            const q = await this.channel.assertQueue('', { exclusive: true });
            console.log(q);
            await this.channel.bindQueue(q.queue, exchange, '');
            
            this.channel.consume(q.queue, function(message) {
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

    public publishToQueue = async (exchange, message) => {
        try {
            console.log(this.channel);
            console.log(this.channel.checkExchange(exchange));
            this.channel.assertExchange(exchange, 'fanout', { durable: false });
            this.channel.publish(exchange, '', Buffer.from(message));
        } catch (error) {
            // handle error response
            console.error(error, 'Unable to connect to cluster!');  
            process.exit(1);
        }
    }
}

export default Queue



