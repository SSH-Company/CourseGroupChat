import { Request, Response } from 'express'
import {
    Controller,
    Post
} from '@overnightjs/core';
import * as STATUS from 'http-status-codes';
import amqp from 'amqplib';
import { config } from '../../config/rabbitMq'

@Controller('message')
export class MessageController {
    @Post('')
    private async submitMessage(req: Request, res: Response) {
        const message = req.body.message;
        await this.publishToQueue(config.rabbit.queue, message[0].text);
        res.status(STATUS.OK).json();
    }
    
    private async publishToQueue(queue, message, durable = false) {
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
}