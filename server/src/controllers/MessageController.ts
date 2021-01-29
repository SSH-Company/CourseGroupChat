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
    
    /*
        Expected body type
        message: array of IMEssages [],
        recipientID: {
            id: number,
            name: string,
            avatar: string (url)
        }
    */
    @Post('')
    private async submitMessage(req: Request, res: Response) {
        const messages = req.body.message;
        const allMessages:any[] = messages.messages
        const recipientID = messages.recipientID
        for (const message of allMessages) {
            const queueName = `message-queue-${recipientID.id}`
            const queueData = { ...message, recipientID: recipientID }
            await this.publishToQueue(queueName, JSON.stringify(queueData));
        }
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