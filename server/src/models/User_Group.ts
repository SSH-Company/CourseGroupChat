import { Database } from '../services/Database';

interface UserGroupInterface {
    ID?: string;
    USER_ID?: string;
    GROUP_ID?: string;
    NAME?: string;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";
}

export class UserGroupModel implements UserGroupInterface {
    ID?: string;
    USER_ID?: string;
    GROUP_ID?: string;
    NAME?: string;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";

    constructor(raw: UserGroupInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(userID: string, grpID: string, name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO RT.USER_GROUP ("USER_ID", "GROUP_ID", "NAME", "CREATE_DATE", "IS_ACTIVE") 
                            VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'Y'); `
            
            Database.getDB()
                .query(query, [userID, grpID, name])
                .then(() => resolve())
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getRecipients(uid: string): Promise<UserGroupModel[]> {
        const query = `SELECT "USER_ID" FROM RT.USER_GROUP WHERE "GROUP_ID" = ?;`
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data:UserGroupModel[]) => {
                    resolve(data.map((d: UserGroupInterface) => new UserGroupModel(d)))
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }
}