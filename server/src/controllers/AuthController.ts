import { Request, Response } from 'express'
import {
    Middleware,
    Controller,
    Get,
    Post
} from '@overnightjs/core';
import { CMail } from '../services/CMail';
import { UserModel } from '../models/User';
import { AccountVerificationModel } from '../models/Account_Verification';
import passport from 'passport';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as path from 'path';
import * as STATUS from 'http-status-codes';

@Controller('auth')
export class AuthController {
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

    @Post('login')
    private async login(req: Request, res: Response) {
        try {
            const session = req.session;
            const { email = '', password = '' } = req.body;
            
            if (email === '' || password === '') {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Required parameters - email, password"
                })
                return;
            }

            const user = await UserModel.getUserAccountByEmail(email);

            if (!user) {
                //this email is not recognised
                res.status(STATUS.BAD_REQUEST).json({
                    message: "We are unable to find an account registered with this email. Try creating a new account."
                })
                return;
            }

            const isPasswordCorrect = await bcrypt.compareSync(password, user.PASSWORD);
            
            if (!isPasswordCorrect) {
                //incorrect password
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Password is incorrect. Please try again."
                })
            }

            //save session data
            session.user = user;

            res.status(STATUS.OK).json({
                _id: user.ID,
                name: user.FIRST_NAME + ' ' + user.LAST_NAME,
                avatar: user.AVATAR,
                email: user.EMAIL,
                verified: user.VERIFIED
            })
        } catch(err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to login."
            })
        }
    }

    @Post('signup')
    private async signUp(req: Request, res: Response) {
        try {
            const session = req.session;

            const { firstName = '', lastName = '', email = '', password = '' } = req.body;
            
            if (firstName === '' || lastName === '' || email === '' || password === '') {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Required parameters - firstName, lastName, email, password"
                })
                return;
            }

            //check if this email already exists
            const existingUser = await UserModel.getUserAccountByEmail(email);
            if (existingUser) {
                //user already exists, return error
                res.status(STATUS.CONFLICT).json({
                    message: "An account with this email already exists"
                });
                return;
            } 

            //generate verification link
            const uniqueVerificationLink = crypto.randomBytes(64).toString('hex');

            //hash the password
            const hash = await bcrypt.hashSync(password, 8);

            //insert new user model
            const newUser = {
                FIRST_NAME: firstName,
                LAST_NAME: lastName,
                EMAIL: email,
                PASSWORD: hash,
                VERIFIED: "N"
            } as UserModel;

            const user = await UserModel.insert(newUser);

            //save session data
            session.user = user;

            //store the hash in account verification table
            const newAccount = {
                USER_ID: user.ID,
                VERIFICATION_ID: uniqueVerificationLink
            } as AccountVerificationModel;
            
            await AccountVerificationModel.insert(newAccount);

            //send the user an email with verification link attached
            const link = `https://cirkle.ca/api/auth/verify?userId=${user.ID}&token=${uniqueVerificationLink}`
            const mail = {
                to: email,
                subject: "Cirkle - Verify your email",
                html: `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`
            }
            await CMail.createMail().sendMail(mail);

            res.status(STATUS.OK).json({
                _id: user.ID,
                name: user.FIRST_NAME + ' ' + user.LAST_NAME,
                avatar: user.AVATAR,
                email: user.EMAIL,
                verified: user.VERIFIED
            })
        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to signup.",
                err: err
            })
        }
    }

    @Get('verify')
    private async verify(req: Request, res: Response) {
        try {
            const { userId = '', token = '' } = req.query;

            if (userId === '' || token === '') {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Required parameters - userId, token"
                })
                return;
            }

            //check token against user id
            const account = await AccountVerificationModel.getUserAccountByID(userId);

            if (!account) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "This user ID is not recognised by our system."
                })
                return;
            }

            const timestamp = (new Date(account.CREATE_DATE)).getTime() / 1000;
            const current = (new Date()).getTime() / 1000;
            
            //check if the verification id match and the token has not expired (7 days limit)
            if (account.VERIFICATION_ID === token && Math.abs(current - timestamp) < 604800) {
                //update VERIFIED status on user model and remove the hash string from DB
                await UserModel.updateVerified('Y', userId);
                await AccountVerificationModel.deleteByUserId(userId);

                res.sendFile(path.join(__dirname, '../public/client/verified.html'))
                return;
            } else {
                res.sendFile(path.join(__dirname, '../public/client/timeout.html'))
            }

        } catch(err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to verify your account.",
                err: err
            })
        }
    }
}