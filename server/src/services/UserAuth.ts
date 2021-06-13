import { Request, Response, NextFunction } from 'express'
import { Session } from './Session';
import { Exception } from './Exception';
import * as STATUS from 'http-status-codes';

/**
 * Middleware function, verifies user id and activity expiration time
*/
export const userAuthMiddleWare = (req: Request, res: Response, next: NextFunction): void => {
    let session = Session.getSession(req);
    
    if (!session) {
        next(
            new Exception({
                status: STATUS.INTERNAL_SERVER_ERROR,
                message: "Session not found, please reload the app to log in.",
                identifier: "UA001"
            })
        );
        return;
    }

    let userID = session.user?.ID;
    if (!userID) {
        next(
            new Exception({
                status: STATUS.UNAUTHORIZED,
                message: "User ID not found, please reload the app to login.",
                identifier: "UA002"
            })
        );
        return;
    }

    //check last access time, restrict to 1 hr, if the user is not active after an hour, we will destroy the current session
    if (session.lastAccess) {
        const lastAccessTime = new Date(session.lastAccess);
        const expireTime = new Date()
        expireTime.setTime(lastAccessTime.getTime() + (60 * 60 * 1000)) // Ttl is 1 hour

        const currentTime = new Date()
        //if the session expires, destroy the session
        if (currentTime > expireTime) {
            session.destroy(() => {
                console.info(`Destroyed session due to inactivity: ${session.user.ID}`)
            });
            next(
                new Exception({
                    status: STATUS.UNAUTHORIZED,
                    message: "User is no longer active, please reload the app to log back in.",
                    identifier: "UA003"
                })
            );
            return;
        }
    }

    //user has been verified, refresh lastAccess
    session.lastAccess = (new Date()).toString();
    next();
}




