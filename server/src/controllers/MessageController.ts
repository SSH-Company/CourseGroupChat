import { Request, Response } from 'express'
import {
    Middleware,
    Controller,
    Post,
    Get
} from '@overnightjs/core';
import multer from 'multer';
import * as STATUS from 'http-status-codes';
import { publishToQueue } from '../services/Queue';
import { UserModel } from '../models/User';
import { MessageModel } from '../models/Message';
import { UserGroupModel } from '../models/User_Group';
import { ChatLogViewModel } from '../models/ChatLog_View';
import BaseUrl from '../services/BaseUrl';

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/client/media/messages/')
    },
    filename: function (req, file, cb) {
        const extension = file.mimetype.split('/')[1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + extension)
    }
})

const upload = multer({ storage: storage })

@Controller('message')
export class MessageController {

    @Get(':id')
    private getLog(req: Request, res: Response) {
        const session = req.session;
        const id = req.params.id
        const emptyResponse = '/media/empty_profile_pic.jpg';

        ChatLogViewModel.getUserLog(id)
        .then(data => {
            const responseJson = [];
            data.forEach(row => {
                const json = {
                    id: row.GROUP_ID,
                    creator_id: row.CREATOR_ID,
                    creator_name: row.CREATOR_NAME,
                    message_id: row.MESSAGE_ID,
                    name: row.VERIFIED === "Y" ? row.GROUP_ID : row.NAME,
                    avatar_url: `${BaseUrl}${row.AVATAR ? row.AVATAR : emptyResponse}`,
                    created_at: row.CREATE_DATE,
                    status: row.STATUS || 'Read',
                    verified: row.VERIFIED
                }
                if (row.MESSAGE_ID) {
                    json[row.MESSAGE_TYPE] = row.MESSAGE_BODY,
                    json['subtitle'] = row.MESSAGE_TYPE === "text" ? row.MESSAGE_BODY : `${row.CREATOR_ID === session.user.ID ? 'You': row.CREATOR_ID} sent a ${row.MESSAGE_TYPE}.`                        
                } else {
                    json['subtitle'] = `You have been added to ${json.name}!`
                }
                responseJson.push(json)
            })

            res.status(STATUS.OK).json(responseJson)
        })
        .catch(err => {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while fetching user chat log.",
                identifier: "MC001"
            })
        }) 
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
    @Middleware([upload.single('media')])
    private async submitMessage(req: Request, res: Response) {
        
        try {
            const session = req.session;
            const user = session.user as UserModel;

            const messages = JSON.parse(req.body.message);
            const message = messages.messages[0]
            const groupID = messages.groupID
            const senderID = {
                _id: user.ID,
                name: user.FIRST_NAME + ' ' + user.LAST_NAME,
                avatar: 'https://placeimg.com/140/140/any'
            }

            let messageType: "text" | "image" | "video" = "text", 
                urlFilePath = '';

            if (req.file) {
                urlFilePath = `${BaseUrl}/media/messages/${req.file.filename}`;
                //assuming file types can be "video" or "image"
                messageType = message.hasOwnProperty('image') ? "image" : "video";
                message[messageType] = urlFilePath
            }

            //find all recipients of this group chat, exclude senderID from the list
            const groupRecipients = (await UserGroupModel.getRecipients(groupID.id)).map(row => row.USER_ID).filter(id => id != senderID._id);    
                        
            //send a message to each recipients queue
            for (const id of groupRecipients) {
                const queueName = `message-queue-${id}`
                const queueData = { ...message, command: "append", groupID: groupID, senderID: senderID }
                await publishToQueue(queueName, JSON.stringify(queueData));
            }
            
            //store message in db
            await MessageModel.insert({ 
                CREATOR_ID: senderID._id, 
                RECIPIENT_GROUP_ID: groupID.id, 
                MESSAGE_BODY: messageType === "text" ? message.text : urlFilePath,
                MESSAGE_TYPE: messageType, 
                STATUS: 'Sent' 
            });    
            
            res.status(STATUS.OK).json();

        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while sending message.",
                identifier: "MC002"
            })
        }
    }

    //use message ids and update their
    //statuses to received. Query the log for all senders of the messages.
    @Post('updateMessageStatus')
    private async updateMessageStatus(req: Request, res: Response) {
        const session = req.session;
        const user = session.user as UserModel;
        
        const { groups, status } = req.body;
        
        if (!Array(groups) || !['Delivered', 'Read'].includes(status)) {
            res.status(STATUS.BAD_REQUEST).json({
                message: "Request body must contain array of [group ids] / Request status must be Delivered / Read ",
                identifier: "MC003"
            })
        }

        try {
            for (const grp of groups) {
                //find all recipients of this group chat, exclude senderID from the list
                const groupRecipients = (await UserGroupModel.getRecipients(grp)).map(row => row.USER_ID).filter(id => id != user.ID);    
                
                for (const id of groupRecipients) {
                    const queueName = `message-queue-${id}`
                    const queueData = {command: "update", groupID: grp, senderID: user.ID, status: status}
                    await publishToQueue(queueName, JSON.stringify(queueData))
                }

                //TODO: handle delivered status
                const fromStatus = {
                    "Read": "Sent"
                }

                await MessageModel.updateStatus(grp, status, fromStatus[status])
            }

            res.status(STATUS.OK).json()
        
        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while sending request to update message status.",
                identifier: "MC004"
            })
        }
    } 
}