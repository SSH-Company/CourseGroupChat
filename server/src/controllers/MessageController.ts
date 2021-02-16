import { Request, Response } from 'express'
import {
    Controller,
    Post,
    Get
} from '@overnightjs/core';
import * as STATUS from 'http-status-codes';
import { publishToQueue } from '../services/Queue';
import { MessageModel } from '../models/Message';
import { UserGroupModel } from '../models/User_Group';
import { ChatLogViewModel } from '../models/ChatLog_View';

@Controller('message')
export class MessageController {

    @Get(':id')
    private getLog(req: Request, res: Response) {
        const id = req.params.id
    
        try {
           ChatLogViewModel.getUserLog(id)
            .then(data => {
                const json = data.map(row => ({
                    id: row.GROUP_ID,
                    creator_id: row.CREATOR_ID,
                    message_id: row.MESSAGE_ID,
                    name: row.NAME,
                    avatar_url: 'https://placeimg.com/140/140/any',
                    subtitle: row.MESSAGE_BODY,
                    created_at: row.CREATE_DATE
                }))
                res.status(STATUS.OK).json(json)
            }) 

        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while fetching user chat log.",
                identifier: "MC001"
            })
        }
    }

    
    /*
        Expected body type
        message: array of IMEssages [],
        groupID: {
            id: number,
            name: string,
            avatar: string (url)
        }
    */
    @Post('')
    private async submitMessage(req: Request, res: Response) {
        const messages = req.body.message;
        const message = messages.messages[0]
        const groupID = messages.groupID
        const senderID = messages.senderID
        
        try {
            //find all recipients of this group chat, exclude senderID from the list
            const groupRecipients = (await UserGroupModel.getRecipients(groupID.id)).map(row => row.USER_ID).filter(id => id != senderID._id);    
            
            //send a message to each recipients queue
            for (const id of groupRecipients) {
                const queueName = `message-queue-${id}`
                const queueData = { ...message, groupID: groupID, senderID: senderID }
                await publishToQueue(queueName, JSON.stringify(queueData));
            }

            //store message in db
            await MessageModel.insert({ CREATOR_ID: senderID._id, RECIPIENT_GROUP_ID: groupID.id, MESSAGE_BODY: message.text });    
            
            res.status(STATUS.OK).json();

        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while sending message.",
                identifier: "MC002"
            })
        }
    }

    //step 4: create function updateLog, use message ids and update their
    //statuses to received. Query the log for all senders of the messages. 
}