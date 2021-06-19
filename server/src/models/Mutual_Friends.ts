import { Database } from '../services/Database';

interface MutualFriendsInterface {
    MUTUAL_FRIEND_AVATARS?: string;
    MUTUAL_FRIENDS_NAMES?: string;
    MUTUAL_FRIEND_IDS?: string;
}

export class MutualFriendsModel implements MutualFriendsInterface {
    MUTUAL_FRIEND_AVATARS?: string;
    MUTUAL_FRIENDS_NAMES?: string;
    MUTUAL_FRIEND_IDS?: string;

    constructor(raw: MutualFriendsInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getMutualFriends(userOne: string, userTwo: string): Promise<MutualFriendsModel[]> {
        return new Promise((resolve, reject) => {
            const query = `select "MUTUAL_FRIEND_AVATARS", "MUTUAL_FRIENDS_NAMES", "MUTUAL_FRIEND_IDS" from rt."MUTUAL_FRIENDS" mf 
            where "USER_ONE" = ? and "USER_TWO" = ?`
            Database.getDB()
                .query(query, [userOne, userTwo])
                .then((data: MutualFriendsInterface[]) => resolve(data.map(d => new MutualFriendsModel(d))))
                .catch(err => reject(err))
        })
    }
}