import { Request, Response } from 'express'
import {
    Controller,
    Post
} from '@overnightjs/core';
import * as STATUS from 'http-status-codes';
import { GroupModel } from '../models/Group';
import { UserGroupModel } from '../models/User_Group';
import { publishToQueue } from '../services/Queue';

@Controller('group')
export class GroupController {
    @Post('')
    private async createGroup(req: Request, res: Response) {
        const { sender, recipients, groupName } = req.body;

        if(!Array.isArray(recipients) || recipients.length === 0 || !groupName) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Request must contain array of [recipients], and a valid Group Name.",
                identifier: "GC001"
            })
        }
        
        try {

            //create new group and retrieve group ID
            const newGroup = await GroupModel.insert();
            
            //insert sender into the new group
            await UserGroupModel.insert(sender, newGroup.ID, groupName);

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
                avatar_url: 'https://placeimg.com/140/140/any'
            });

        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong while attempting to create a new group.",
                identifier: "GC002"
            })
        }
    }

}