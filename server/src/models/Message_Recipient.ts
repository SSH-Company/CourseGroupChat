import { Database } from '../services/Database';

interface MessageRecipientInterface {
    ID?: number;
    RECIPIENT_ID?: number;
    RECIPIENT_GROUP_ID?: number;
    MESSAGE_ID?: number;
    IS_READ?: "Y" | "N";
}

export class UserModel implements MessageRecipientInterface {
    ID?: number;
    RECIPIENT_ID?: number;
    RECIPIENT_GROUP_ID?: number;
    MESSAGE_ID?: number;
    IS_READ?: "Y" | "N";

    constructor(raw: MessageRecipientInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(user: MessageRecipientInterface): Promise<void> {
        const query = `INSERT INTO RT.MESSAGE_RECIPIENT ("RECIPIENT_ID", "MESSAGE_ID", "IS_READ") 
        VALUES (?, ?, ?);`
        const params = [user.RECIPIENT_ID, user.MESSAGE_ID, user.IS_READ];
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, params)
                .then(() => resolve())
                .catch(err => reject(err))
        })
    }
}