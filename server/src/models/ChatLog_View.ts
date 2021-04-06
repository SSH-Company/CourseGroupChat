import { Database } from '../services/Database';

interface ChatLogViewInterface {
    USER_ID?: string;
    GROUP_ID?: string;
    VERIFIED?: 'Y' | 'N';
    AVATAR?: string;
    CREATOR_ID?: string;
    CREATOR_NAME?: string;
    NAME: string;
    MESSAGE_ID?: string;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "text" | "image" | "video";
    CREATE_DATE?: string;
    STATUS?: string;
}

export class ChatLogViewModel implements ChatLogViewInterface {
    USER_ID?: string;
    GROUP_ID?: string;
    VERIFIED?: 'Y' | 'N';
    AVATAR?: string;
    CREATOR_ID?: string;
    CREATOR_NAME?: string;
    NAME: string;
    MESSAGE_ID?: string;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "text" | "image" | "video";
    CREATE_DATE?: string;
    STATUS?: string;

    constructor(raw: ChatLogViewInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getUserLog(uid: number): Promise<ChatLogViewModel[]> {
        const query = `
        SELECT * FROM (
            SELECT
                "USER_ID",
                "GROUP_ID",
                "VERIFIED",
                "AVATAR",
                "CREATOR_ID",
                "CREATOR_NAME",
                "NAME",
                "MESSAGE_ID",
                "MESSAGE_BODY",
                "MESSAGE_TYPE",
                "STATUS",
                "CREATE_DATE",
                ROW_NUMBER() OVER (PARTITION BY CV."GROUP_ID" ORDER BY CV."CREATE_DATE" DESC) AS ROW_ID
            FROM RT."CHATLOG_VIEW" CV
            WHERE "USER_ID" = ? AND "VERIFIED" IS NOT NULL
        ) CHATLOG WHERE ROW_ID < 5;`

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data: ChatLogViewInterface[]) => resolve(data.map(d => new ChatLogViewModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getEarlierMessages(groupID: string, userID: string, rowCount: string): Promise<ChatLogViewModel[]> {
        const query = `SELECT * FROM RT."CHATLOG_VIEW" CV
                        WHERE CV."GROUP_ID" = ? AND CV."USER_ID" = ?
                        ORDER BY CV."CREATE_DATE"
                        FETCH FIRST ? ROWS ONLY;`

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [groupID, userID, rowCount])
                .then((data: ChatLogViewInterface[]) => resolve(data.map(d => new ChatLogViewModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }
}


