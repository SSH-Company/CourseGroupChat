import { Database } from '../services/Database';

interface UserInterface {
    ID?: number;
    FIRST_NAME?: string;
    LAST_NAME?: string;
    EMAIL?: string;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";
}

export class UserModel implements UserInterface {
    ID?: number;
    FIRST_NAME?: string;
    LAST_NAME?: string;
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

    static getUserAccount(uid: string): Promise<UserModel> {
        const query = `SELECT * FROM RT.USER WHERE "ID" = ?;`
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data:UserModel[]) => {
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
}