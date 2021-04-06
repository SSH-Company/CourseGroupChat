import { Database } from '../services/Database';

interface MessageInterface {
    ID?: string;
    CREATOR_ID?: string;
    RECIPIENT_GROUP_ID?: string;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "image" | "text" | "video";
    CREATE_DATE?: string;
    STATUS?: string;
}

export class MessageModel implements MessageInterface {
    ID?: string;
    CREATOR_ID?: string;
    RECIPIENT_GROUP_ID?: string;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "image" | "text" | "video";
    CREATE_DATE?: string;
    STATUS?: string;

    constructor(raw: MessageInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(msg: MessageInterface): Promise<void> {
        const query = `INSERT INTO RT.MESSAGE ("ID", "CREATOR_ID", "RECIPIENT_GROUP_ID", "MESSAGE_BODY", "MESSAGE_TYPE", "CREATE_DATE", "STATUS") VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?) `;
        const params = [msg.ID, msg.CREATOR_ID, msg.RECIPIENT_GROUP_ID, msg.MESSAGE_BODY, msg.MESSAGE_TYPE, msg.STATUS];

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, params)
                .then(() => resolve())
                .catch(err => reject(err))
        })
    }   

    static delete(groupID: string, messageID: string): Promise<void> {
        const query = `DELETE FROM RT.MESSAGE WHERE "ID" = ? AND "RECIPIENT_GROUP_ID" = ? `;
        const params = [messageID, groupID];

        return new Promise((resolve, reject) => {
            Database.getDB()
            .query(query, params)
            .then(() => resolve())
            .catch(err => reject(err))
        })
    }

    static getById(id: string): Promise<MessageModel> {
        const query = `${SELECT} WHERE "ID" = ? `;

        return new Promise((resolve, reject) => {
            Database.getDB()
            .query(query, [id])
            .then((data: MessageInterface[]) => resolve(new MessageModel(data[0])))
            .catch(err => reject(err))
        })
    }

    static updateStatus(groupID: string, userName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = ` UPDATE RT.MESSAGE SET "STATUS" = "STATUS" || '${userName}' 
                            WHERE "RECIPIENT_GROUP_ID" = ? AND "STATUS" NOT LIKE '%${userName}%'`;
            const params = [groupID];
            
            Database.getDB()
                .query(query, params)
                .then(() => resolve())
                .catch(err => reject(err))
        })
    }
}

const SELECT = `
SELECT 
"ID",
"CREATOR_ID",
"RECIPIENT_GROUP_ID",
"MESSAGE_BODY",
"MESSAGE_TYPE",
"CREATE_DATE",
"STATUS"
FROM RT.MESSAGE
`