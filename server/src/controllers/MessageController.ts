import { Request, Response } from 'express'
import {
    Controller,
    Post
} from '@overnightjs/core';
import * as STATUS from 'http-status-codes';
import { publishToQueue } from '../services/Queue';

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
            await publishToQueue(queueName, JSON.stringify(queueData));
        }
        res.status(STATUS.OK).json();
    }
}