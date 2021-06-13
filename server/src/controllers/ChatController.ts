import { Request, Response } from 'express'
import {
    ClassMiddleware,
    Middleware,
    Controller,
    Post,
    Get,
    Delete
} from '@overnightjs/core';
import fs from 'fs';
import multer from 'multer';
import * as STATUS from 'http-status-codes';
import { CONNECTIONS } from '../WSServer';
import { Session } from '../services/Session';
import { Config } from '../services/Config';
import { Bucket } from '../services/Bucket';
import { userAuthMiddleWare } from '../services/UserAuth';
import { UserModel } from '../models/User';
import { MessageModel } from '../models/Message';
import { UserGroupModel } from '../models/User_Group';
import { ChatLogViewModel } from '../models/ChatLog_View';

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

@ClassMiddleware([userAuthMiddleWare])
@Controller('chat')
export class ChatController {

    @Get('log/:id')
    private getLog(req: Request, res: Response) {
        const id = req.params.id;

        ChatLogViewModel.getUserLog(id)
        .then(data => {
            const responseJson = [];
            data.forEach(row => {
                const json = {
                    id: row.GROUP_ID,
                    creator_id: row.CREATOR_ID,
                    creator_name: row.CREATOR_NAME,
                    creator_avatar: row.CREATOR_AVATAR,
                    message_id: row.MESSAGE_ID,
                    name: row.VERIFIED === "Y" ? row.GROUP_ID : row.NAME,
                    avatar_url: row.AVATAR,
                    location: row.LOCATION,
                    created_at: row.CREATE_DATE,
                    status: row.STATUS,
                    verified: row.VERIFIED
                }
                if (row.MESSAGE_ID && row.MESSAGE_TYPE) {
                    json[row.MESSAGE_TYPE] = row.MESSAGE_BODY,
                    json['subtitle'] = row.MESSAGE_TYPE === "text" ? row.MESSAGE_BODY : `${row.CREATOR_ID === id ? 'You': row.CREATOR_NAME} sent a ${row.MESSAGE_TYPE}.`                        
                } else {
                    json['subtitle'] = `You have joined to ${json.name}!`
                }
                responseJson.push(json)
            })
            
            res.status(STATUS.OK).json(responseJson)
        })
        .catch(err => {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while fetching user chat log.",
                identifier: "CC001"
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
            const session = Session.getSession(req);
            const user = session.user;
            const config = Config.getConfig().s3;

            const messages = JSON.parse(req.body.message);
            const message = messages.messages[0]
            const groupID = messages.groupID
            const senderID = {
                _id: user.ID,
                name: user.FIRST_NAME + ' ' + user.LAST_NAME,
                avatar: user.AVATAR
            }

            let messageType: "text" | "image" | "video" | "file" | "audio" = "text";

            const newMessage = {
                ID: message._id,
                CREATOR_ID: senderID._id, 
                RECIPIENT_GROUP_ID: groupID.id,  
                STATUS: ''
            } as MessageModel
            
            if (req.file) {
                //assuming file types can be "video", "image" or "file"
                if (message.hasOwnProperty('image')) messageType = 'image'
                else if (message.hasOwnProperty('video')) messageType = 'video'
                else if (message.hasOwnProperty('audio')) messageType = 'audio'
                else messageType = "file"

                //upload to s3
                const bucket = Bucket.getBucket().bucket;

                const fileContent = fs.readFileSync(req.file.path);

                const params = {
                    Bucket: config.BUCKET_NAME,
                    Key: req.file.filename,
                    Body: fileContent
                }

                bucket.upload(params, async (err, data) => {
                    if (err) {
                        throw err;
                    }
                    message[messageType] = req.file.originalname;
                    message.location = data.Location;
                    newMessage.LOCATION = data.Location;
                    newMessage.MESSAGE_BODY = req.file.originalname;
                    newMessage.MESSAGE_TYPE = messageType;
                    await MessageModel.insert(newMessage);
                })

                fs.unlinkSync(req.file.path);
            } else {
                newMessage.MESSAGE_TYPE = messageType;
                newMessage.MESSAGE_BODY = message.text;
                await MessageModel.insert(newMessage);
            }

            //find all recipients of this group chat, exclude senderID from the list
            const groupRecipients = (await UserGroupModel.getMembers(groupID.id)).map(row => row.USER_ID).filter(id => id != senderID._id);    

            //send a message to each recipients queue
            for (const id of groupRecipients) {
                const queueName = `message-queue-${id}`
                const queueData = { ...message, command: "append", groupID: groupID, senderID: senderID }
                const queue = CONNECTIONS[user.ID];
                await queue.publishToQueue(queueName, JSON.stringify(queueData));
            }   
            
            res.status(STATUS.OK).json();

        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while sending message.",
                identifier: "CC002"
            })
        }
    }

    //use message ids and update their
    //statuses to received. Query the log for all senders of the messages.
    @Post('updateMessageStatus')
    private async updateMessageStatus(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const user = session.user;
            
            const { groupID } = req.body;
            
            if (!groupID) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Request body must contain group ID",
                    identifier: "CC003"
                })
            }

            await MessageModel.updateStatus(groupID, user.FIRST_NAME + ' ' + user.LAST_NAME)

            //find all recipients of this group chat, exclude senderID from the list
            const groupRecipients = (await UserGroupModel.getMembers(groupID)).map(row => row.USER_ID).filter(id => id != user.ID);    
            
            for (const id of groupRecipients) {
                const queueName = `message-queue-${id}`
                const queueData = { command: "refresh", groupID: groupID }
                const queue = CONNECTIONS[user.ID];
                await queue.publishToQueue(queueName, JSON.stringify(queueData))
            }
            
            res.status(STATUS.OK).json()
        
        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while sending request to update message status.",
                identifier: "CC004"
            })
        }
    } 

    @Delete('')
    private async deleteMessage(req: Request, res: Response) {
        try{
            const { groupID, messageID } = req.body;
            const config = Config.getConfig().s3;

            if (!groupID || !messageID) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Request body must contain { groupID, messageID }",
                    identifier: "CC005"
                })
            }

            const message = await MessageModel.getById(messageID);

            if (message.MESSAGE_TYPE !== "text") {
                const path = message.MESSAGE_BODY.split('.com/')[1];

                //remove from s3
                const bucket = Bucket.getBucket().bucket;

                const params = {
                    Bucket: config.BUCKET_NAME,
                    Key: path,
                }

                bucket.deleteObject(params, async (err, data) => {
                    if (err) {
                        throw err;
                    }
                });
            }

            await MessageModel.delete(groupID, messageID);
            res.status(STATUS.OK).json({ message: "successfully deleted message!" });
        
        } catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to delete message.",
                identifier: "CC006"
            })
        }
    }

    @Post('join-group')
    private async joinGroup(req: Request, res: Response) {
        
        try {
            const session = Session.getSession(req);
            const { id, name, verified = 'N' } = req.body;
            
            if (typeof id !== 'string' || id === ''
                || typeof name !== 'string' || name === ''
            ) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Request body must contain [id] and [name].",
                    identifier: "CC007"
                })
                return;
            }

            if (verified === 'Y') {
                const enrolledGroups = await UserGroupModel.getEnrolledCourses(session.user.ID);
                if (enrolledGroups.length >= 8) {
                    res.status(STATUS.OK).json({
                        status: 'warning'
                    })
                    return
                }
            }
            
            //insert user into the group
            await UserGroupModel.insert(session.user.ID, id, name);
            res.status(STATUS.OK).json({
                status: 'success'
            });

        } catch(err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to join new group.",
                identifier: "CC008"
            })
        }
    }

    @Delete('remove-from-group')
    private async removeFromGroup(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const { users, grpId, leave } = req.body;

            if (!grpId || leave === undefined) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Request parameter must contain grpId and leave parameter.",
                    identifier: "CC009"
                });
                return;
            }

            const removeUsers = leave === true ? [session.user.ID] : users;

            await UserGroupModel.removeFromGroup(removeUsers, grpId);

            res.status(STATUS.OK).json();
            return;
        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to leave group.",
                identifier: "CC010"
            })
        }
    }

    @Get('group-members/:grpId')
    private async getGroupMembers(req: Request, res: Response) {
        try {
            const grpId = req.params.grpId;

            if (!grpId) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Request parameter must contain grpId",
                    identifier: "CC011"
                });
                return;
            }

            const members = await UserModel.getMembersByGroupId(grpId);

            res.status(STATUS.OK).json(members.map(row => ({
                id: row.ID,
                name: row.FIRST_NAME + ' ' + row.LAST_NAME,
                avatar_url: row.AVATAR,
                checked: false
            })));

        } catch(err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to retrieve group member list.",
                identifier: "CC012"
            })
        }
    }

    @Get('load-earlier-messages')
    private getEarlierMessages(req: Request, res: Response) {
        const session = Session.getSession(req);
        const { groupID, rowCount } = req.query;

        if (!groupID || !rowCount) {
            res.status(STATUS.BAD_REQUEST).json({
                message: "Request parameter must contain groupID and rowCount",
                identifier: "CC013"
            });
            return;
        }

        ChatLogViewModel.getEarlierMessages(groupID, session.user.ID, rowCount)
            .then(data => {
                const responseJson = [];
                data.forEach(row => {
                    let subtitle = '';
                    if (row.MESSAGE_ID && row.MESSAGE_BODY.length > 0) {
                        subtitle = row.MESSAGE_TYPE === "text" ? row.MESSAGE_BODY : `${row.CREATOR_ID === session.user.ID ? 'You': row.CREATOR_NAME} sent a ${row.MESSAGE_TYPE}.`
                    } else subtitle = `You have joined ${row.NAME}!`
                    const json = {
                        _id: row.MESSAGE_ID,
                        created_at: row.CREATE_DATE,
                        [row.MESSAGE_TYPE]: row.MESSAGE_BODY,
                        subtitle: subtitle,
                        user: {
                            _id: row.CREATOR_ID,
                            name: row.CREATOR_NAME,
                            avatar: row.CREATOR_AVATAR
                        },
                        location: row.LOCATION,
                        status: row.STATUS,
                        displayStatus: false
                    }
                    responseJson.push(json)
                })
                res.status(STATUS.OK).json(responseJson)
            })
            .catch(err => {
                console.error(err);
                res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Something went wrong while attempting to retrieve earlier messages.",
                    identifier: "CC014"
                })
            })
    }

    @Get('gallery/:grpId')
    private async getGroupGallery(req: Request, res: Response) {
        try {
            const grpId = req.params.grpId;

            if (!grpId) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Request parameter must contain grpId",
                    identifier: "CC015"
                });
                return;
            }

            const members = await MessageModel.getGallery(grpId);

            res.status(STATUS.OK).json(members.map(row => ({
                body: row.LOCATION,
                type: row.MESSAGE_TYPE
            })));
        } catch(err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to retrieve group images/videos.",
                identifier: "CC016"
            })
        }
    }
}