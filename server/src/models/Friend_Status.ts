import { Database } from '../services/Database';

export interface FriendStatusInterface {
    SENDER?: string;
    RECEIVER?: string;
    STATUS?: "Pending" | "Accepted" | "Rejected";
}

export class FriendStatusModel implements FriendStatusInterface {
    SENDER?: string;
    RECEIVER?: string;
    STATUS?: "Pending" | "Accepted" | "Rejected";

    constructor(raw: FriendStatusInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getStatus(userOne: string, userTwo: string): Promise<FriendStatusModel> {
        return new Promise((resolve, reject) => {
            const query = `SELECT "SENDER", "STATUS" FROM RT.FRIEND_STATUS 
                            WHERE ("SENDER" = ? AND "RECEIVER" = ?) 
                            OR ("SENDER" = ? AND "RECEIVER" = ?);`;
            const params = [userOne, userTwo, userTwo, userOne];
            
            Database.getDB()
            .query(query, params)
            .then((data: FriendStatusInterface[]) => {
                if (data.length > 0) resolve(new FriendStatusModel(data[0]))
                else resolve(null);
            })
            .catch(err => reject(err))
        })
    }

    static insert(row: FriendStatusInterface): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO RT.FRIEND_STATUS ("SENDER", "RECEIVER", "STATUS")
                            VALUES (?, ?, ?)`;
            const params = [row.SENDER, row.RECEIVER, row.STATUS];

            Database.getDB()
            .query(query, params)
            .then(() => resolve())
            .catch(err => reject(err))
        })
    }

    static updateStatus(row: FriendStatusInterface): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `UPDATE RT.FRIEND_STATUS SET "STATUS" = ?
                            WHERE "SENDER" = ? AND "RECEIVER" = ?;`;
            const params = [row.STATUS, row.SENDER, row.RECEIVER];

            Database.getDB()
            .query(query, params)
            .then(() => resolve())
            .catch(err => reject(err))
        })
    }
}