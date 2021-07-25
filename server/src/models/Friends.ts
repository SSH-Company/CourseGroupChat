import { Database } from '../services/Database';

interface FriendsInterface {
    FRIEND_AVATARS?: string;
    FRIENDS_NAMES?: string;
    FRIEND_IDS?: string;
}

export class FriendsModel implements FriendsInterface {
    FRIEND_AVATARS?: string;
    FRIENDS_NAMES?: string;
    FRIEND_IDS?: string;

    constructor(raw: FriendsInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getFriends(userID: string): Promise<FriendsModel[]> {
        return new Promise((resolve, reject) => {
            const query = `select "FRIEND_AVATARS", "FRIENDS_NAMES", "FRIEND_IDS" from rt."FRIENDS"
            where "USER_ID" = ?`
            Database.getDB()
                .query(query, [userID])
                .then((data: FriendsInterface[]) => resolve(data.map(d => new FriendsModel(d))))
                .catch(err => reject(err))
        })
    }
}