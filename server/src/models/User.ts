import { Database } from '../services/Database';

interface UserInterface {
    ID?: string;
    FIRST_NAME?: string;
    LAST_NAME?: string;
    AVATAR?: string;
    EMAIL?: string;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";
}

export class UserModel implements UserInterface {
    ID?: string;
    FIRST_NAME?: string;
    LAST_NAME?: string;
    AVATAR?: string;
    EMAIL?: string;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";

    constructor(raw: UserInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(user: UserInterface): Promise<void> {
        const query = `INSERT INTO RT.USER ("FIRST_NAME", "LAST_NAME", "EMAIL", "CREATE_DATE", "IS_ACTIVE") 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?);`
        const params = [user.FIRST_NAME, user.LAST_NAME, user.EMAIL, user.IS_ACTIVE];
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, params)
                .then(() => resolve())
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

    static getUserAccountByEmail(email: string): Promise<UserModel> {
        const query = `SELECT * FROM RT.USER WHERE lower("EMAIL") = ?;`

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [email.trim().toLowerCase()])
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
}