import { Request, Response } from 'express'
import {
    Controller,
    Get,
    Post,
    Delete
} from '@overnightjs/core';
import { CMail } from '../services/CMail';
import { Session } from '../services/Session';
import { UserModel } from '../models/User';
import { Exception } from '../services/Exception';
import { AccountVerificationModel } from '../models/Account_Verification';
// import passport from 'passport';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as path from 'path';
import * as STATUS from 'http-status-codes';

@Controller('auth')
export class AuthController {
    // @Get('')
    // // @Middleware([passport.authenticate('saml')])
    // private async userLogin(req: Request, res: Response) {
    //     let session = Session.getSession(req);
    //     const user = await UserModel.getUserAccountByEmail(req.query.email);
    //     session.user = user;
    //     res.status(STATUS.OK).json(user);
    // }
    
    // @Post('callback')
    // @Middleware([passport.authenticate('saml', { failureRedirect: '/', failureFlash: true })])
    // private async successLogin(req: Request, res: Response) {
    //     try {
    //         //TODO: add a service to ensure session is alive
    //         let session = Session.getSession(req);
    //         const user = await UserModel.getUserAccountByEmail(req.user.nameID);
    //         session.user = user;
    //         const html = `<div class="userBody">${JSON.stringify(user)}</div>`
    //         res.status(STATUS.OK).send(html);
    //     } catch {
    //         res.status(STATUS.INTERNAL_SERVER_ERROR).json({
    //             message: "Something went wrong attempting to retrieve user information."
    //         })
    //     }
    // }

    @Post('login')
    private async login(req: Request, res: Response) {
        try {
            const session = Session.getSession(req);
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

            const isPasswordCorrect = await bcrypt.compareSync(password, user.PASSWORD) || password === user.PASSWORD;
            
            if (!isPasswordCorrect) {
                //incorrect password
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Password is incorrect. Please try again."
                })
            }

            //save session data
            session.user = user;
            session.lastAccess = (new Date()).toString();

            res.status(STATUS.OK).json({
                _id: user.ID,
                name: user.FIRST_NAME + ' ' + user.LAST_NAME,
                avatar: user.AVATAR,
                email: user.EMAIL,
                verified: user.VERIFIED,
                password: user.PASSWORD
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
            const session = Session.getSession(req);

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
            session.lastAccess = (new Date()).toString();

            await this.sendVerificationMail(user.ID, email);

            res.status(STATUS.OK).json({
                _id: user.ID,
                name: user.FIRST_NAME + ' ' + user.LAST_NAME,
                avatar: user.AVATAR,
                email: user.EMAIL,
                verified: user.VERIFIED,
                password: user.PASSWORD
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

            //check if user ID is valid
            const userAccount = await UserModel.getUserAccountByID(userId);

            if (!userAccount) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "This user ID is not recognised by our system."
                })
                return;
            }

            //check if this user is already verified
            if (userAccount.VERIFIED === 'Y') {
                res.status(STATUS.OK).json({
                    status: "success"
                })
                return;
            }

            //check token against user id
            const account = await AccountVerificationModel.getUserAccountByID(userId);

            if (!account) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Unable to find token related to this user ID."
                })
                return;
            }

            const timestamp = (new Date(account.CREATE_DATE)).getTime() / 1000;
            const current = (new Date()).getTime() / 1000;
            
            //check if the verification id match and the token has not expired (7 days limit 604800)
            if (account.VERIFICATION_ID === token && Math.abs(current - timestamp) < 604800) {
                //update VERIFIED status on user model and remove the hash string from DB
                await UserModel.updateVerified('Y', userId);
                await AccountVerificationModel.deleteByUserId(userId);

                // res.sendFile(path.join(__dirname, '../public/client/verified.html'))
                res.status(STATUS.OK).json({
                    status: "success"
                })
                return;
            } else {
                await AccountVerificationModel.deleteByUserId(userId);

                res.status(STATUS.OK).json({
                    status: "expired"
                });
            } 
        } catch(err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to verify your account.",
                err: err
            })
        }
    }

    @Delete('logout')
    private async logout(req: Request, res: Response) {
        const session = Session.getSession(req);

        new Promise((resolve, reject) => {
            let session = Session.getSession(req);
            if (session) {
                session.destroy((err) => {
                    if (err) {
                        reject(
                            new Exception({
                                message: "Failed to destroy session",
                                identifier: "AC011",
                                trace: err
                            })
                        )
                        return;
                    }
                    resolve('Success');
                })               
            }
        })
        .then(() => {
            res.status(STATUS.OK).json({
                message: "Logout success"
            })
        })
        .catch(err => {
            res.status(err.status).json(err);
        })
    }

    @Post('resend-verification')
    private async resendVerification(req: Request, res: Response) {
        try {
            const { userId = '' } = req.body;

            if (userId === '') {
                res.status(STATUS.BAD_REQUEST).json(
                    new Exception({
                        message: "Request body must contain userId",
                        identifier: "AC012"
                    })
                )
            }

            const user = await UserModel.getUserAccountByID(userId);

            if (!user || !user.EMAIL) {
                res.status(STATUS.BAD_REQUEST).json(
                    new Exception({
                        message: "This user id / email does not exist.",
                        identifier: "AC013"
                    })
                )
            }

            await this.sendVerificationMail(user.ID, user.EMAIL);           

            res.status(STATUS.OK).json({
                email: user.EMAIL,
                message: "Success"
            });

        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json(
                new Exception({
                    message: "Failed to resend verification email.",
                    identifier: "AC014",
                    trace: err
                })
            )
        }
    }

    @Post("generate-reset-link")
    private async generateResetLink(req: Request, res: Response) {
        const { email = '' } = req.body;

        if (email === '') {
            res.status(STATUS.BAD_REQUEST).json(
                new Exception({
                    message: "Request body must contain email",
                    identifier: "AC015"
                })
            )
        }

        const user = await UserModel.getUserAccountByEmail(email);

        if (!user) {
            res.status(STATUS.BAD_REQUEST).json(
                new Exception({
                    message: "This user id / email does not exist.",
                    identifier: "AC016"
                })
            )
        }
        
        //generate verification link
        const uniqueVerificationLink = crypto.randomBytes(64).toString('hex');
        
        //store the hash in account verification table
        const newAccount = {
            USER_ID: user.ID,
            VERIFICATION_ID: uniqueVerificationLink
        } as AccountVerificationModel;

        await AccountVerificationModel.insert(newAccount);

        //send the user an email with verification link attached
        const link = `https://cirkle.ca/resetPassword/${user.ID}/${uniqueVerificationLink}`
        const mail = {
            to: user.EMAIL,
            subject: "Cirkle - Reset your password",
            html: `Hello,<br> Please Click on the link to reset your password.<br><a href=${link}>Click here to reset.</a>`
        }

        await CMail.createMail().sendMail(mail); 

        res.status(STATUS.OK).json({
            message: "success"
        })
    }

    private async sendVerificationMail(id: string, email: string) {
        //generate verification link
        const uniqueVerificationLink = crypto.randomBytes(64).toString('hex');

        //store the hash in account verification table
        const newAccount = {
            USER_ID: id,
            VERIFICATION_ID: uniqueVerificationLink
        } as AccountVerificationModel;

        await AccountVerificationModel.insert(newAccount);

        //send the user an email with verification link attached
        const link = `https://cirkle.ca/verify/${id}/${uniqueVerificationLink}`
        const mail = {
            to: email,
            subject: "Cirkle - Verify your email",
            html: `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`
        }
        await CMail.createMail().sendMail(mail);  

        return;
    }
}




