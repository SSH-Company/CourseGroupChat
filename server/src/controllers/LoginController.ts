import { Request, Response } from 'express'
import {
    Middleware,
    Controller,
    Get,
    Post
} from '@overnightjs/core';
import { UserModel } from '../models/User';
import passport from 'passport';
import * as STATUS from 'http-status-codes';

@Controller('login')
export class LoginController {
    @Get('')
    // @Middleware([passport.authenticate('saml')])
    private async userLogin(req: Request, res: Response) {
        let session = req.session;
        const user = await UserModel.getUserAccountByEmail(req.query.email);
        session.user = user;
        res.status(STATUS.OK).json(user);
    }
    
    @Post('callback')
    @Middleware([passport.authenticate('saml', { failureRedirect: '/', failureFlash: true })])
    private async successLogin(req: Request, res: Response) {
        try {
            //TODO: add a service to ensure session is alive
            let session = req.session;
            const user = await UserModel.getUserAccountByEmail(req.user.nameID);
            session.user = user;
            const html = `<div class="userBody">${JSON.stringify(user)}</div>`
            res.status(STATUS.OK).send(html);
        } catch {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to retrieve user information."
            })
        }
    }
}