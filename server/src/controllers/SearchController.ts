import { Request, Response } from 'express';
import {
    Middleware,
    Controller,
    Post,
    Get
} from '@overnightjs/core';
import multer from 'multer';
import * as STATUS from 'http-status-codes';
import { UserModel } from '../models/User';
import { GroupModel } from '../models/Group';
import { UserGroupModel } from '../models/User_Group';
import { UserGroupListModel } from '../models/UserGroupList';
import { CONNECTIONS } from '../WSServer';

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

@Controller('search')
export class SearchController {
    @Get('users')
    private async searchList(req: Request, res: Response) {
        try {
            const excludeIds = req.query.excludeIds || [];
            const users = (await UserModel.getUsersForSearch(excludeIds)).map(row => ({
                id: row.ID,
                name: row.FIRST_NAME + ' ' + row.LAST_NAME,
                avatar_url: row.AVATAR
            }));
            res.status(STATUS.OK).json(users);
        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to get user list.",
                identifier: "SC001"
            })
        }
    }

    @Get('all-groups')
    private verifiedGroupsList(req: Request, res: Response) {
        const session = req.session;
        const user = session.user as UserModel;
        console.log(req.sessionStore.sessions);
        UserGroupListModel.getUserGroupSearchList(user.ID)
            .then(list => {
                res.status(STATUS.OK).json(list.map(row => ({
                    id: row.CODE,
                    name: row.VERIFIED === "Y" ? row.CODE : row.NAME,
                    avatar_url: row.AVATAR,
                    verified: row.VERIFIED
                })))
            })
            .catch(err => {
                res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Something went wrong while attempting to get verified course list.",
                    identifier: "SC002"
                })
            })
    }

    @Post('create-group')
    @Middleware([upload.single('avatar')])
    private async createGroup(req: Request, res: Response) {
        try {
            const session = req.session;
            const recipients = JSON.parse(req.body.recipients);
            const groupName = req.body.groupName;
            const urlFilePath = req.file ? `/media/profiles/${req.file.filename}` : '';

            if(!Array.isArray(recipients) || recipients.length === 0 || !groupName) {
                res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Request must contain array of [recipients], and a valid Group Name.",
                    identifier: "SC003"
                })
            }

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
                const queue = CONNECTIONS[session.user.ID];
                await queue.publishToQueue(queueName, JSON.stringify(queueData))
            }

            res.status(STATUS.OK).json({
                id: newGroup.ID,
                name: groupName,
                avatar_url: urlFilePath
            });

        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to create a new group.",
                identifier: "SC004"
            })
        }
    }

    @Post('add-members')
    private async addMembers(req: Request, res: Response) {
        try {
            const session = req.session;
            const { groupID, groupName, recipients } = req.body;

            if (!groupID || !groupName || !Array.isArray(recipients)) {
                res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Invalid parameters for adding group.",
                    identifier: "SC005"
                });
                return;
            }

            if (recipients.length === 0) {
                res.status(STATUS.OK).json();
                return;
            }

            //insert members into new group
            //send a message to other group members to refresh their logs
            for(const id of recipients) {
                await UserGroupModel.insert(id, groupID, groupName);
                const queueName = `message-queue-${id}`
                const queueData = { command: "refresh" }
                const queue = CONNECTIONS[session.user.ID];
                await queue.publishToQueue(queueName, JSON.stringify(queueData))
            }

            res.status(STATUS.OK).json({
                message: "Successfully added all members."
            });

        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to add group members.",
                identifier: "SC006"
            })
        }
    }

}