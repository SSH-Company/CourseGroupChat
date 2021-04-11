import { Request, Response } from 'express';
import {
    Middleware,
    Controller,
    Post
} from '@overnightjs/core';
import fs from 'fs';
import multer from 'multer';
import * as STATUS from 'http-status-codes';
import { UserModel } from '../models/User';
import BaseUrl from '../BaseUrl';

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

            //remove existing profile picture from file system
            if (user.AVATAR.trim().length) {
                const path = user.AVATAR.split('profiles/')[1];
                const fullPath = `src/public/client/media/profiles/${path}`;
                fs.unlinkSync(fullPath);
            }

            const urlFilePath = req.file ? `${BaseUrl}/media/profiles/${req.file.filename}` : '';
            await UserModel.updateAvatar(urlFilePath, user.ID);

            res.status(STATUS.OK).json({
                path: urlFilePath
            });
        }catch (err) {
            console.error(err);
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to upload profile picture.",
                identifier: "PC001"
            })
        }
    }
}