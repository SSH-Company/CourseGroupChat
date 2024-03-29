import { Request, Response } from 'express';
import {
    ClassMiddleware,
    Controller,
    Post,
    Get
} from '@overnightjs/core';
import * as STATUS from 'http-status-codes';
import { userAuthMiddleWare } from '../services/UserAuth';
import { Database } from '../services/Database';
import { Session } from '../services/Session';
import { Exception } from '../services/Exception';
import { UserModel } from '../models/User';
import { GroupModel } from '../models/Group';
import { UserGroupModel } from '../models/User_Group';
import { UserRelationModel } from '../models/User_Relation';
import { CourseGroupsModel } from '../models/Course_Groups';
import { CONNECTIONS } from '../WSServer';
@ClassMiddleware([userAuthMiddleWare])
@Controller('search')
export class SearchController {
    @Get('users')
    private async searchList(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const excludeIds = req.query.excludeIds || [];
            const users = (await UserModel.getUsersForSearch(excludeIds)).map(row => ({
                id: row.ID,
                name: row.FIRST_NAME + ' ' + row.LAST_NAME,
                avatar_url: row.AVATAR
            })).filter(row => row.id !== session.user.ID);

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
    private allGroupsList(req: Request, res: Response) {
        const session = Session.getSession(req);
        const user = session.user as UserModel;
        UserGroupModel.getGroupInformation(user.ID)
            .then(list => {
                res.status(STATUS.OK).json(list.map(row => ({
                    id: row.GROUP_ID,
                    name: row.NAME || 'Just You',
                    avatar_url: row.AVATAR ? row.AVATAR : row.CUSTOM_AVATAR?.split(',')[0] || null,
                    verified: row.VERIFIED,
                    member_count: row.MEMBER_COUNT
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
    private async createGroup(req: Request, res: Response) {
        try {
            await Database.getDB().transaction(async db => {
                const session = Session.getSession(req);
                const recipients = req.body.recipients;

                if(!Array.isArray(recipients) || recipients.length === 0) {
                    res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                        message: "Request must contain array of [recipients], and a valid Group Name.",
                        identifier: "SC003"
                    });
                    return;
                }

                const recipientIDs = []; 
                
                for (let r of recipients) {
                    recipientIDs.push(r.id)
                }

                //auto-generate names based on other members
                let filteredMembers = recipients.filter(row => row.id !== session.user.ID)
                
                //generate group id from member ids
                const newGroupId = `${recipientIDs.sort().join('').trim()}-${Math.floor(Math.random() * 999)}`;

                //create new group and retrieve group ID
                const newGroup = await GroupModel.insert(newGroupId, db);

                const otherMembers = [];
                for (const r of filteredMembers) {
                    otherMembers.push(r.name)
                }

                //insert sender into the new group
                await UserGroupModel.insert(session.user.ID, newGroup.ID, null, db);
                //insert members into new group
                //send a message to other group members to refresh their logs
                for(const id of recipientIDs) {
                    await UserGroupModel.insert(id, newGroup.ID, null, db);
                    const queueName = `message-queue-${id}`
                    const queueData = { command: "refresh", groupId: newGroup.ID }
                    const queue = CONNECTIONS[session.user.ID];
                    if (queue) await queue.publishToQueue(queueName, JSON.stringify(queueData))
                }
                
                res.status(STATUS.OK).json({
                    id: newGroup.ID
                });
            })

            return;
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
            const session = Session.getSession(req);
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

            await Database.getDB().transaction(async db => {
                //insert members into new group
                //send a message to other group members to refresh their logs
                for(const id of recipients) {
                    await UserGroupModel.insert(id, groupID, null, db);
                    const queueName = `message-queue-${id}`
                    const queueData = { command: "refresh", groupId: groupID }
                    const queue = CONNECTIONS[session.user.ID];
                    if (queue) await queue.publishToQueue(queueName, JSON.stringify(queueData))
                }

                res.status(STATUS.OK).json({
                    message: "Successfully added all members."
                });
            })

            return;
        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to add group members.",
                identifier: "SC006"
            })
        }
    }

    @Get('friends')
    private async friendList(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const users = (await UserModel.getFriendList(session.user.ID)).map(row => ({
                id: row.ID,
                name: row.FIRST_NAME + ' ' + row.LAST_NAME,
                avatar_url: row.AVATAR
            }));
            
            res.status(STATUS.OK).json(users);
        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to get friend list.",
                identifier: "SC007"
            })
        }
    }

    @Get('friend-search')
    private async friendSearchList(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const users = (await UserRelationModel.getUserRelation(session.user.ID)).map(row => ({
                id: row.USER_TWO,
                name: row.USER_TWO_FIRST_NAME + ' ' + row.USER_TWO_LAST_NAME,
                avatar_url: row.USER_TWO_AVATAR,
                friendStatus: row.STATUS
            }));
            
            res.status(STATUS.OK).json(users);
        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to get friend list.",
                identifier: "SC008"
            })
        }
    }

    @Get('verified-groups')
    private async allVerifiedGroupsList(req: Request, res: Response) {
        try {
            const verifiedGroups = (await CourseGroupsModel.getAllGroups()).map(d => ({
                id: d.CODE,
                avatar: d.AVATAR,
                name: d.CODE,
                subtitle: d.NAME,
                verified: 'Y'
            }))

            res.status(STATUS.OK).json(verifiedGroups)
        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to get verified groups list.",
                identifier: "SC009"
            })
        }
    }

    @Get('existing-groups')
    private async checkIfGroupExists(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const { recipients = [] } = req.query;

            if (recipients === '') {
                res.status(STATUS.BAD_REQUEST).json(
                    new Exception({
                        message: "Request must contain recipients.",
                        identifier: "SC010"
                    })
                )
            }

            //generate group id from member ids
            const newGroupId = `${recipients.sort().join('').trim()}-`;
            const existingGroups = await UserGroupModel.getGroupInformation(session.user.ID, newGroupId); 
            
            if (existingGroups.length > 0) {
                res.status(STATUS.OK).json(existingGroups.map(d => ({
                    id: d.GROUP_ID,
                    avatar_url: d.AVATAR ? d.AVATAR : d.CUSTOM_AVATAR?.split(',')[0] || null,
                    name: d.NAME,
                    verified: d.VERIFIED,
                    member_count: d.MEMBER_COUNT
                })));
            } else {
                res.status(STATUS.OK).json([]);
            }

            return;
            
        } catch (err) {
            console.error(err)
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to check if this group exists.",
                identifier: "SC011"
            })
        }
    }
}


