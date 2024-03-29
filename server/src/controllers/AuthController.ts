import { Request, Response } from 'express'
import {
    Controller,
    Get,
    Post,
    Delete
} from '@overnightjs/core';
import { Client } from 'pg';
import { CMail } from '../services/CMail';
import { Database } from '../services/Database';
import { Session } from '../services/Session';
import { UserModel } from '../models/User';
import { Exception } from '../services/Exception';
import { AccountVerificationModel } from '../models/Account_Verification';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as STATUS from 'http-status-codes';

@Controller('auth')
export class AuthController {
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

            await Database.getDB().transaction(async db => {
                //insert new user model
                const newUser = {
                    FIRST_NAME: firstName,
                    LAST_NAME: lastName,
                    EMAIL: email,
                    PASSWORD: hash,
                    VERIFIED: "N"
                } as UserModel;

                const user = await UserModel.insert(newUser, db);

                //save session data
                session.user = user;
                session.lastAccess = (new Date()).toString();

                await this.sendVerificationMail(user.ID, email, db);

                res.status(STATUS.OK).json({
                    _id: user.ID,
                    name: user.FIRST_NAME + ' ' + user.LAST_NAME,
                    avatar: user.AVATAR,
                    email: user.EMAIL,
                    verified: user.VERIFIED,
                    password: user.PASSWORD
                })
            });

            return;
        } catch (err) {
            console.log(err)
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

            console.log(account)

            if (!account) {
                res.status(STATUS.BAD_REQUEST).json({
                    message: "Unable to find token related to this user ID."
                })
                return;
            }

            const timestamp = (new Date(account.CREATE_DATE)).getTime() / 1000;
            const current = (new Date()).getTime() / 1000;

            await Database.getDB().transaction(async db => {
                await AccountVerificationModel.deleteByUserId(userId, db);

                //check if the verification id match and the token has not expired (7 days limit 604800)
                if (account.VERIFICATION_ID === token && Math.abs(current - timestamp) < 604800) {
                    //update VERIFIED status on user model and remove the hash string from DB
                    await UserModel.updateVerified('Y', userId, db);
    
                    // res.sendFile(path.join(__dirname, '../public/client/verified.html'))
                    res.status(STATUS.OK).json({
                        status: "success"
                    })
                    return;
                } else {
                    res.status(STATUS.OK).json({
                        status: "expired"
                    });
                } 
            })

            return;
        } catch(err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong attempting to verify your account.",
                err: err
            })
        }
    }

    @Delete('logout')
    private async logout(req: Request, res: Response) {

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

            await Database.getDB().transaction(async db => {
                //delete current row from Account Verification table
                await AccountVerificationModel.deleteByUserId(user.ID, db);
                await this.sendVerificationMail(user.ID, user.EMAIL, db); 
            })

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
        try {
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
        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json(
                new Exception({
                    message: "Failed to send reset password email.",
                    identifier: "AC017",
                    trace: err
                })
            )
        }
    }

    @Post('reset-password')
    private async resetPassword(req: Request, res: Response) {
        try {
            const { userId = '', token = '', password = '' } = req.body;

            if (userId === '' || token === '' || password === '') {
                res.status(STATUS.BAD_REQUEST).json(
                    new Exception({
                        message: "Required parameters include userId, token, password, retypePassword",
                        identifier: "AC018"
                    })
                )
                return;
            }

            //ensure token is valid

            //check token against user id
            const account = await AccountVerificationModel.getUserAccountByID(userId);

            if (!account) {
                res.status(STATUS.BAD_REQUEST).json(
                    new Exception({
                        message: "Unable to find token related to this user ID.",
                        identifier: "AC019"
                    })
                )
                return;
            }

            const timestamp = (new Date(account.CREATE_DATE)).getTime() / 1000;
            const current = (new Date()).getTime() / 1000;

            await Database.getDB().transaction(async client => {
                await AccountVerificationModel.deleteByUserId(userId, client);

                //check if the verification id match and the token has not expired (1 day limit)
                if (account.VERIFICATION_ID === token && Math.abs(current - timestamp) < 86400) {
                    //create new password and update user pass
                    //hash the password
                    const hash = await bcrypt.hashSync(password, 8);
                    await UserModel.updatePassword(hash, account.USER_ID, client);

                    res.status(STATUS.OK).json({
                        status: "success"
                    })
                    return;
                } else {
                    res.status(STATUS.OK).json({
                        status: "expired"
                    });
                    return;
                }
            })

            return;
        } catch (err) {
            res.status(STATUS.INTERNAL_SERVER_ERROR).json(
                new Exception({
                    message: "Failed to reset password.",
                    identifier: "AC017",
                    trace: err
                })
            )
        }
    }

    private async sendVerificationMail(id: string, email: string, db: Client | Database = Database.getDB()) {
        //generate verification link
        const uniqueVerificationLink = crypto.randomBytes(64).toString('hex');

        //store the hash in account verification table
        const newAccount = {
            USER_ID: id,
            VERIFICATION_ID: uniqueVerificationLink
        } as AccountVerificationModel;

        await AccountVerificationModel.insert(newAccount, db);

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




