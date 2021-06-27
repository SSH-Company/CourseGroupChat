import { Request, Response } from 'express';
import {
    ClassMiddleware,
    Middleware,
    Controller,
    Post,
    Get,
    Put,
    Delete
} from '@overnightjs/core';
import fs from 'fs';
import multer from 'multer';
import * as STATUS from 'http-status-codes';
import { userAuthMiddleWare } from '../services/UserAuth';
import { Exception } from '../services/Exception';
import { Session } from '../services/Session';
import { Config } from '../services/Config';
import { Bucket } from '../services/Bucket';
import { UserModel } from '../models/User';
import { FriendStatusModel, FriendStatusInterface } from '../models/Friend_Status';
import { UserGroupModel } from '../models/User_Group';
import { CommonGroupsModel } from '../models/Common_Groups';
import { MutualFriendsModel } from '../models/Mutual_Friends';

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

@ClassMiddleware([userAuthMiddleWare])
@Controller('profile')
export class ProfileController {
    @Post('upload-profile-pic')
    @Middleware([upload.single('avatar')])
    private async uploadPicture(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const config = Config.getConfig().s3;
            const bucket = Bucket.getBucket().bucket;

            //retrieve latest user information
            const user = await UserModel.getUserAccountByID(session.user.ID);

            //remove existing profile picture from file system
            if (user.AVATAR?.trim().length > 0) {
                const path = user.AVATAR.split('.com/')[1];
                //remove from s3
                const params = {
                    Bucket: config.BUCKET_NAME,
                    Key: path
                }

                bucket.deleteObject(params, async (err, data) => {
                    if (err) {
                        throw err;
                    }
                });
            }

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
                
                await UserModel.updateAvatar(data.Location, user.ID);

                fs.unlinkSync(req.file.path);

                res.status(STATUS.OK).json({
                    path: data.Location
                });
            })

            return;

        }catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to upload profile picture.",
                identifier: "PC001"
            })
        }
    }

    @Get('settings/:id')
    private async getProfileById(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const profileID = req.params.id;
            const result = await Promise.all([
                UserModel.getUserAccountByID(profileID),
                FriendStatusModel.getStatus(profileID, session.user.ID)
            ]);
            const user = result[0];
            const friendStatus = result[1];
            
            res.status(STATUS.OK).json({
                user: {
                    _id: user.ID,
                    name: user.FIRST_NAME + ' ' + user.LAST_NAME,
                    avatar: user.AVATAR
                },
                friendStatus: {
                    sender: friendStatus ? friendStatus.SENDER : null,
                    status: friendStatus ? friendStatus.STATUS: null
                }
            });
        } catch(err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to get profile page information.",
                identifier: "PC002"
            })
        }
    }

    @Post('friend-request')
    private async sendRequest(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const profileID = req.body.id;
            const newRequest: FriendStatusInterface = {
                SENDER: session.user.ID,
                RECEIVER: profileID,
                STATUS: 'PENDING'
            }
            await FriendStatusModel.insert(newRequest);
            res.status(STATUS.OK).json();

        } catch(err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to send friend request.",
                identifier: "PC003"
            })
        }
    }

    @Put('friend-request')
    private async acceptRequest(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const id = req.body.id;
            await FriendStatusModel.accept(id, session.user.ID);
            res.status(STATUS.OK).json();
        } catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to update friend status.",
                identifier: "PC004"
            })
        }
    }

    @Delete('friend-request')
    private async deleteRequest(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const id = req.body.id;
            await FriendStatusModel.reject(id, session.user.ID, id, session.user.ID);
            res.status(STATUS.OK).json();
        } catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to delete friend status.",
                identifier: "PC005"
            })
        }
    }

    @Get('friend-request')
    private async getRequests(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const requests = (await UserModel.getFriendRequests(session.user.ID)).map(row => ({
                id: row.ID,
                name: row.FIRST_NAME + ' ' + row.LAST_NAME,
                avatar_url: row.AVATAR
            }));

            res.status(STATUS.OK).json(requests);
        } catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to get friend requests.",
                identifier: "PC006"
            })
        }
    }

    @Get('course-groups')
    private async getCourseGroups(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const enrolledGroups = (await UserGroupModel.getEnrolledCourses(session.user.ID)).map(d => ({
                id: d.GROUP_ID,
                name: d.NAME
            }));
            
            res.status(STATUS.OK).json(enrolledGroups)
        } catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to get enrolled course groups.",
                identifier: "PC007"
            })
        }
    }

    @Get('mutual-course-groups')
    private async getMutualCourseGroups(req: Request, res: Response) {
        try {
            const session = req.session;
            const userTwo = req.query.id;
            const mutualGroups = await CommonGroupsModel.getMutualCourseGroups(session.user.ID, userTwo);
            const listed = mutualGroups.map(row => ({
                id: row.CODES.split(','),
                name: row.NAMES.split(',')
            }))
            const id = listed[0].id
            const name = listed[0].name
            const result = Array.from(
                id.map((e, i) => ({id: e, name: name[i]}))
                    .reduce((a, b) => a.set(b.id, (a.get(b.id) || []).concat(b.name)), new Map))
                .map(([k, v]) => ({id:k, name: v.join()}));

            res.status(STATUS.OK).json(result);
        } catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to get enrolled course groups.",
                identifier: "PC007"
            })
        }
    }

    @Get('mutual-friends')
    private async getMutualFriends(req: Request, res: Response) {
        try {
            const session = req.session;
            const userTwo = req.query.id;
            const mutualFriends = await MutualFriendsModel.getMutualFriends(session.user.ID, userTwo);
            const listed = mutualFriends.map(row => ({
                avatar: row.MUTUAL_FRIEND_AVATARS.split(','),
                name: row.MUTUAL_FRIENDS_NAMES.split(','),
                ids: row.MUTUAL_FRIEND_IDS.split(',')
            }))
            const avatar = listed[0].avatar
            const name = listed[0].name
            const id = listed[0].ids
            const result = Array.from(
                avatar.map((e, i) => ({avatar: e, name: name[i], id: id[i]}))
                    .reduce((a, b) => a.set(b.avatar, (a.get(b.avatar) || []).concat(b.name, b.id)), new Map))
                .map(([k, v]) => ({avatar:k, name: v.join().split(',')[0], id:v.join().split(',')[1]}));

            res.status(STATUS.OK).json(result);
        } catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to get mutual friends.",
                identifier: "PC009"
            })
        }
    }

    @Get('ignored-groups')
    private async getIgnoredGroups(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
            const ignoredGroups = (await UserGroupModel.getIgnoredGroups(session.user.ID)).map(d => ({
                id: d.GROUP_ID,
                name: d.NAME,
                avatar: d.AVATAR
            }));
            
            res.status(STATUS.OK).json(ignoredGroups)
        } catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json(
                new Exception({
                    message: "Something went wrong attempting to get ignored course groups.",
                    identifier: "PC010"
                })
            )
        }
    }
}


