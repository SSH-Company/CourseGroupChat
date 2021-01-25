//code taken from https://github.com/firebase007/logRocket-rabbit-tutorial.git

import amqp from 'amqplib';
import { config } from '../config/rabbitMq';

const consumeFromQueue = async (queue, isNoAck = false, durable = false, prefetch = null) => {

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
            console.log(' [x] Received', message.content.toString());
            channel.ack(message);
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

consumeFromQueue(config.rabbit.queue);