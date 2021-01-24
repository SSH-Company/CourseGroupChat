import { Database } from '../services/Database';

interface MessageInterface {
    ID?: number;
    CREATOR_ID?: number;
    MESSAGE_BODY?: string;
    CREATE_DATE?: string;
}

export class UserModel implements MessageInterface {
    ID?: number;
    CREATOR_ID?: number;
    MESSAGE_BODY?: string;
    CREATE_DATE?: string;

    constructor(raw: MessageInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(user: MessageInterface): Promise<void> {
        const query = `INSERT INTO RT.MESSAGE ("CREATOR_ID", "MESSAGE_BODY", "CREATE_DATE") 
        VALUES (?, ?, CURRENT_TIMESTAMP);`
        const params = [user.CREATOR_ID, user.MESSAGE_BODY];
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, params)
                .then(() => resolve())
                .catch(err => reject(err))
        })
    }
}