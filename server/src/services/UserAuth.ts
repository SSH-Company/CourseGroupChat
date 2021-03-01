import NodeCache from 'node-cache';
import passport from 'passport';
import { Request, Response } from 'express';

const cache = new NodeCache()

export function verifyToken(token: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        // if (cache.has(token)) {
        //     console.log('cache hit: ' + token)
        //     resolve(cache.get(token))
        // } else {
        //     passport.authenticate('samlStrategy'), 
        //     (req, res) => {
        //         console.log(req.user)
        //     };
        //     const tokenMap = {
        //         'TOKEN_ONE': 1,
        //         'TOKEN_TWO': 2
        //     }
        //     const uid = tokenMap[token]
        //     cache.set(token, uid)
        //     resolve(uid)
        // }
        // passport.authenticate('samlStrategy'),
        // (req, res) => {
        //     console.log('aksgdjkhadkhjasdbkj')
        //     console.log(req.user)
        // }
        
        console.log('tanvir');
            const tokenMap = {
                'TOKEN_ONE': 1,
                'TOKEN_TWO': 2
            }
            const uid = tokenMap[token]
            cache.set(token, uid)
            resolve(uid)
    })
}