import { Request, Response } from 'express'
import {
    Controller,
    Post
} from '@overnightjs/core';
import * as STATUS from 'http-status-codes';
import { GroupModel } from '../models/Group';
import { UserGroupModel } from '../models/User_Group';

@Controller('group')
export class GroupController {
    @Post('')
    private async createGroup(req: Request, res: Response) {
        const { sender, recipients } = req.body;

        if(!Array.isArray(recipients) || recipients.length === 0) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Request must contain array of [recipients].",
                identifier: "GC001"
            })
        }
        
        try {

            //TODO: generate grp name on frontend
            const grpName = 'TEST GROUP';

            //create new group and retrieve group ID
            const newGroup = await GroupModel.insert();
            
            //insert sender into the new group
            await UserGroupModel.insert(sender, newGroup.ID, grpName)

            //insert members into new group
            for(const id of recipients) {
                await UserGroupModel.insert(id, newGroup.ID, grpName)
            }

            res.status(STATUS.OK).json({
                id: newGroup.ID,
                name: grpName,
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