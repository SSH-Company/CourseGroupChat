import { Request, Response } from 'express';
import {
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
import { Config } from '../services/Config';
import { Bucket } from '../services/Bucket';
import { UserModel } from '../models/User';
import { FriendStatusModel, FriendStatusInterface } from '../models/Friend_Status';

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

@Controller('profile')
export class ProfileController {
    @Post('upload-profile-pic')
    @Middleware([upload.single('avatar')])
    private async uploadPicture(req: Request, res: Response) {
        try {
            const session = req.session;
            const user = session.user;
            const config = Config.getConfig().s3;
            const bucket = Bucket.getBucket().bucket;

            console.log(req.session);
            console.log(user);
            //remove existing profile picture from file system
            if (user.AVATAR?.trim().length > 0) {
                const path = user.AVATAR.split('.com/')[1];
                console.log(path);
                //remove from s3
                const params = {
                    Bucket: config.BUCKET_NAME,
                    Key: path
                }

                bucket.deleteObject(params);
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
            const session = req.session;
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
            const session = req.session;
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
            const session = req.session;
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
    private async rejectRequest(req: Request, res: Response) {
        try {
            const session = req.session;
            const id = req.body.id;
            await FriendStatusModel.reject(id, session.user.ID);
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
            const session = req.session;
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
}