import { Database } from '../services/Database';

interface MessageInterface {
    ID?: number;
    CREATOR_ID?: number;
    RECIPIENT_GROUP_ID?: number;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "image" | "text";
    CREATE_DATE?: string;
    STATUS?: string;
}

export class MessageModel implements MessageInterface {
    ID?: number;
    CREATOR_ID?: number;
    RECIPIENT_GROUP_ID?: number;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "image" | "text";
    CREATE_DATE?: string;
    STATUS?: string;

    constructor(raw: MessageInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(msg: MessageInterface): Promise<void> {
        const query = `INSERT INTO RT.MESSAGE ("CREATOR_ID", "RECIPIENT_GROUP_ID", "MESSAGE_BODY", "MESSAGE_TYPE", "CREATE_DATE", "STATUS") VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?) `;
        const params = [msg.CREATOR_ID, msg.RECIPIENT_GROUP_ID, msg.MESSAGE_BODY, msg.MESSAGE_TYPE, msg.STATUS];

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, params)
                .then(() => resolve())
                .catch(err => reject(err))
        })
    }

    static updateStatus(groupID: number, toStatus: string, fromStatus: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = ' UPDATE RT.MESSAGE SET "STATUS" = ? WHERE "RECIPIENT_GROUP_ID" = ? AND "STATUS" = ? ';
            const params = [toStatus, groupID, fromStatus];

            Database.getDB()
                .query(query, params)
                .then(() => resolve())
                .catch(err => reject(err))
        })
    }
}