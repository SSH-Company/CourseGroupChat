import NodeCache from 'node-cache'

const cache = new NodeCache()

export function verifyToken(token: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (cache.has(token)) {
            console.log('cache hit: ' + token)
            resolve(cache.get(token))
        } else {
            //Send request to uoft auth INTRO url
            const uid = '1'
            cache.set(token, uid)
            resolve(uid)
        }
    })
}