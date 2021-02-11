import { Database } from '../services/Database';

interface UserGroupInterface {
    ID?: number;
    USER_ID?: number;
    GROUP_ID?: number;
    NAME?: string;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";
}

export class UserGroupModel implements UserGroupInterface {
    ID?: number;
    USER_ID?: number;
    GROUP_ID?: number;
    NAME?: string;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";

    constructor(raw: UserGroupInterface) {
        // super();
        Object.assign(this, raw);
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