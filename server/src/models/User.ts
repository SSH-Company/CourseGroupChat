import { Client } from 'pg';
import { Database } from '../services/Database';

interface UserInterface {
    ID?: string;
    FIRST_NAME?: string;
    LAST_NAME?: string;
    AVATAR?: string;
    EMAIL?: string;
    PASSWORD?: string;
    CREATE_DATE?: string;
    VERIFIED?: "Y" | "N";
}

export class UserModel implements UserInterface {
    ID?: string;
    FIRST_NAME?: string;
    LAST_NAME?: string;
    AVATAR?: string;
    EMAIL?: string;
    PASSWORD?: string;
    CREATE_DATE?: string;
    VERIFIED?: "Y" | "N";

    constructor(raw: UserInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(user: UserInterface): Promise<UserModel> {
        const query = `INSERT INTO RT.USER ("FIRST_NAME", "LAST_NAME", "EMAIL", "PASSWORD", "CREATE_DATE", "VERIFIED") 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?) RETURNING *;`
        const params = [user.FIRST_NAME, user.LAST_NAME, user.EMAIL, user.PASSWORD, user.VERIFIED];
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, params)
                .then((data: UserInterface[]) => resolve(new UserModel(data[0])))
                .catch(err => reject(err))
        })
    }

    static getUserAccountByID(uid: string): Promise<UserModel> {
        const query = `SELECT * FROM RT.USER WHERE "ID" = ?;`
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data:UserInterface[]) => {
                    if (data.length === 0) {
                        reject({
                            message: 'Invalid user id.'
                        })
                    }
                    resolve(new UserModel(data[0]))
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getUserAccountByEmail(email: string): Promise<UserModel | null> {
        const query = `SELECT * FROM RT.USER WHERE lower("EMAIL") = ?;`

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [email.trim().toLowerCase()])
                .then((data:UserInterface[]) => {
                    if (data.length === 0) {
                        resolve(null);
                    }
                    resolve(new UserModel(data[0]))
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getUsersForSearch(excludeIds: string[]): Promise<UserModel[]> {
        const params = Array(excludeIds.length).fill("?").join(",");
        let query = '';
        if (params.length > 0) {
            query = `SELECT * FROM RT.USER WHERE "ID" NOT IN (${params}) ORDER BY "FIRST_NAME" `;
        } else {
            query = `SELECT * FROM RT.USER ORDER BY "FIRST_NAME" `;
        }

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, excludeIds)
                .then((data:UserInterface[]) => resolve(data.map(d => new UserModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getFriendList(userID: string): Promise<UserModel[]> {
        const query = `SELECT * FROM RT.USER u
                    WHERE (
                        SELECT "STATUS" FROM RT.FRIEND_STATUS fs
                        WHERE ("SENDER" = ? AND "RECEIVER" = u."ID") OR ("SENDER" = u."ID" AND "RECEIVER" = ?)
                    ) = 'Accepted';`;

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [userID, userID])
                .then((data:UserInterface[]) => resolve(data.map(d => new UserModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getFriendRequests(user: string): Promise<UserModel[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT u."ID", u."FIRST_NAME" , u."LAST_NAME", u."AVATAR" 
                        FROM RT.FRIEND_STATUS fs2 
                        LEFT JOIN RT.USER u on u."ID" = fs2."SENDER" 
                        WHERE "RECEIVER" = ? AND "STATUS" = 'PENDING'`;

            Database.getDB()
            .query(query, [user])
            .then((data: UserInterface[]) => {
                resolve(data.map(d => new UserModel(d)))
            })
            .catch(err => reject(err))
        })
    }

    static getMembersByGroupId(id: string): Promise<UserModel[]> {
        const query = `SELECT u."ID", u."FIRST_NAME", u."LAST_NAME", u."AVATAR" 
                    FROM RT.USER_GROUP ug
                    LEFT JOIN RT.USER u on ug."USER_ID" = u."ID"
                    WHERE "GROUP_ID" = ? `;
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [id])
                .then((data:UserInterface[]) => resolve(data.map(d => new UserModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static updateAvatar(path: string, id: string): Promise<UserModel[]> {
        const query = `UPDATE RT.USER SET "AVATAR" = ? WHERE "ID" = ? ;`;
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [path, id])
                .then((data:UserInterface[]) => resolve(data.map(d => new UserModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static updateVerified(verified: "Y" | "N", id: string): Promise<UserModel[]> {
        const query = `UPDATE RT.USER SET "VERIFIED" = ? WHERE "ID" = ? ;`;
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [verified, id])
                .then((data:UserInterface[]) => resolve(data.map(d => new UserModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static updatePassword(hash: string, id: string, db: Client | Database = Database.getDB()): Promise<UserModel[]> {
        const query = `UPDATE RT.USER SET "PASSWORD" = ? WHERE "ID" = ? ;`;
        
        return new Promise((resolve, reject) => {
            db
            .query(query, [hash, id])
            .then((data:UserInterface[]) => resolve(data.map(d => new UserModel(d))))
            .catch(err => {
                console.log(err)
                reject(err)
            })
        })
    }
}


