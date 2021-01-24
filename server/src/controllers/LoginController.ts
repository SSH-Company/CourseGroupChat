import { Request, Response } from 'express'
import {
    Controller,
    Post
} from '@overnightjs/core';
import { verifyToken } from '../services/UserAuth';
import { UserModel } from '../models/User';
import * as STATUS from 'http-status-codes';

@Controller('login')
export class LoginController {
    @Post('')
    private userLogin(req: Request, res: Response) {
        let token:string;
        if (req.body.userToken) {
            token = req.body.userToken
        } else {
            res.status(STATUS.BAD_REQUEST).json({
                message: 'Missing [userToken] in request body.',
                identifier: 'LC001'
            })
            return;
        }
        verifyToken(token)
            .then(uid => {
                //TODO: add a service to ensure session is alive
                let session = req.session;
                UserModel.getUserAccount(uid)
                    .then(user => {
                        session.userToken = token;
                        session.actualID = uid;
                        session.user = user;
                        res.status(STATUS.OK).json({
                            id: uid,
                            user: user
                        })
                    }, e => {
                        res.status(STATUS.UNAUTHORIZED).json(e);
                    });
            })
            .catch(err => {
                res.status(err.status).json({
                    message: 'Failed to verify token.',
                    identifier: 'LC002'
                })
            })
        
    }

}