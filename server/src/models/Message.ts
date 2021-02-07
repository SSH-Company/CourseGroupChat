import { Database } from '../services/Database';

interface MessageInterface {
    ID?: number;
    CREATOR_ID?: number;
    RECIPIENT_GROUP_ID?: number;
    MESSAGE_BODY?: string;
    CREATE_DATE?: string;
}

export class MessageModel implements MessageInterface {
    ID?: number;
    CREATOR_ID?: number;
    RECIPIENT_GROUP_ID?: number;
    MESSAGE_BODY?: string;
    CREATE_DATE?: string;

    constructor(raw: MessageInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(msg: MessageInterface): Promise<void> {
        let query = `INSERT INTO RT.MESSAGE ("CREATOR_ID", "RECIPIENT_GROUP_ID", "MESSAGE_BODY", "CREATE_DATE") VALUES (?, ?, ?, ?) `
        const params = [msg.CREATOR_ID, msg.RECIPIENT_GROUP_ID, msg.MESSAGE_BODY, msg.CREATE_DATE];

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, params)
                .then(() => resolve())
                .catch(err => reject(err))
        })
    }
}