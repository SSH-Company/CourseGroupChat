import NodeCache from 'node-cache';
import passport from 'passport';

const cache = new NodeCache()

export function verifyToken(token: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (cache.has(token)) {
            console.log('cache hit: ' + token)
            resolve(cache.get(token))
        } else {
            const tokenMap = {
                'TOKEN_ONE': 1,
                'TOKEN_TWO': 2
            }
            const uid = tokenMap[token]
            cache.set(token, uid)
            resolve(uid)
        }
    })
}