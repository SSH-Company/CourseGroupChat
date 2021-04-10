import amqp from 'amqplib';
import { Config } from './Config';

class Queue {
    public readonly channel;

    constructor(exchange: string, connection: any) {  
        //setup
        const config = Config.getConfig().rabbit;
        amqp.connect(config, function(err0, cluster) {
            if (err0) throw err0;
            cluster.createChannel(function(err1, channel) {
                if (err1) throw err1;
                this.channel = channel;
                
                channel.assertExchange(exchange, 'fanout', {
                    durable: false
                });

                channel.assertQueue('', { exclusive: true }, function(err2, q) {
                    if (err2) throw err2;

                    channel.bindQueue(q.queue, exchange, '');

                    channel.consume(q.queue, function(message) {
                        if (message !== null) {
                            channel.ack(message);
                            connection.sendUTF(message.content)
                            return null;
                        } else {
                            console.log(message, 'Queue is empty!')
                            channel.reject(message);
                        }
                    }, { noAck: true });
                })
            });
        });
    }

    public publishToQueue = async (exchange, message) => {
        try {
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



