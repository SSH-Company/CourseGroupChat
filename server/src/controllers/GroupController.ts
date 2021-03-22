import { Request, Response } from 'express'
import {
    Middleware,
    Controller,
    Post,
    Get,
    Delete
} from '@overnightjs/core';
import multer from 'multer';
import * as STATUS from 'http-status-codes';
import { UserModel } from '../models/User';
import { GroupModel } from '../models/Group';
import { UserGroupModel } from '../models/User_Group';
import { UserGroupListModel } from '../models/UserGroupList';
import { publishToQueue } from '../services/Queue';
import BaseUrl from '../services/BaseUrl';

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/client/media/profiles/')
    },
    filename: function (req, file, cb) {
        const extension = file.mimetype.split('/')[1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + extension)
    }
})

const upload = multer({ storage: storage })

@Controller('group')
export class GroupController {
    @Post('create-group')
    @Middleware([upload.single('avatar')])
    private async createGroup(req: Request, res: Response) {
        const session = req.session;
        const recipients = JSON.parse(req.body.recipients);
        const groupName = req.body.groupName;
        const urlFilePath = `/media/profiles/${req.file.filename}`;

        if(!Array.isArray(recipients) || recipients.length === 0 || !groupName) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Request must contain array of [recipients], and a valid Group Name.",
                identifier: "GC001"
            })
        }
        
        try {

            //create new group and retrieve group ID
            const newGroup = await GroupModel.insert(urlFilePath);
            
            //insert sender into the new group
            await UserGroupModel.insert(session.user.ID, newGroup.ID, groupName);

            //insert members into new group
            //send a message to other group members to refresh their logs
            for(const id of recipients) {
                await UserGroupModel.insert(id, newGroup.ID, groupName);
                const queueName = `message-queue-${id}`
                const queueData = { command: "refresh" }
                await publishToQueue(queueName, JSON.stringify(queueData))
            }

            res.status(STATUS.OK).json({
                id: newGroup.ID,
                name: groupName,
                avatar_url: `${BaseUrl}${urlFilePath}`
            });

        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to create a new group.",
                identifier: "GC002"
            })
        }
    }

    @Get('users')
    private searchList(req: Request, res: Response) {
        UserModel.getAllUsers()
            .then(users => {
                res.status(STATUS.OK).json(users.map(row => ({
                    id: row.ID,
                    name: row.FIRST_NAME + ' ' + row.LAST_NAME,
                    avatar_url: 'https://placeimg.com/140/140/any'
                })))
            })
            .catch(err => {
                res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Something went wrong while attempting to get user list.",
                    identifier: "GC003"
                })
            })
    }

    @Get('all-groups')
    private verifiedGroupsList(req: Request, res: Response) {
        const session = req.session;
        UserGroupListModel.getUserGroupSearchList(session.user.ID)
            .then(list => {
                res.status(STATUS.OK).json(list.map(row => ({
                    id: row.CODE,
                    name: row.VERIFIED === "Y" ? row.CODE : row.NAME,
                    avatar_url: `${BaseUrl}${row.AVATAR ? row.AVATAR : `/media/empty_profile_pic.jpg`}`,
                    verified: row.VERIFIED
                })))
            })
            .catch(err => {
                res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Something went wrong while attempting to get verified course list.",
                    identifier: "GC004"
                })
            })
    }

    @Post('join-group')
    private async joinGroup(req: Request, res: Response) {
        
        try {
            const session = req.session;
            const { id, name } = req.body;
            
            if (typeof id !== 'string' || id === ''
                || typeof name !== 'string' || name === ''
            ) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Request body must contain [id] and [name].",
                    identifier: "GC005"
                })
                return;
            }
            
            //insert user into the group
            await UserGroupModel.insert(session.user.ID, id, name);
            res.status(STATUS.OK).json();
        } catch(err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to join new group.",
                identifier: "GC006"
            })
        }
    }

    @Delete('leave-group/:grpId')
    private async leaveGroup(req: Request, res: Response) {
        try {
            const session = req.session;
            const grpId = req.params.grpId;
            await UserGroupModel.removeFromGroup(session.user.ID, grpId);
            res.status(STATUS.OK).json();
            return;
        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to leave group.",
                identifier: "GC007"
            })
        }
    }



}