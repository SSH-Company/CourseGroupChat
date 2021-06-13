import { Request } from "express";
import { Exception } from "./Exception";

export class Session {
    static getSession(req: Request) {
        if (!req.session) {
            throw new Exception({
                message: "Session init failed.",
                identifier: "S001"
            });
        } else return req.session;
    }
}