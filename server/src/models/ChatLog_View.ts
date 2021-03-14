import { Database } from '../services/Database';

interface ChatLogViewInterface {
    USER_ID?: number;
    GROUP_ID?: number;
    AVATAR?: string;
    CREATOR_ID?: number;
    NAME: number;
    MESSAGE_ID?: string;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "text" | "image";
    CREATE_DATE?: string;
    STATUS?: string;
}

export class ChatLogViewModel implements ChatLogViewInterface {
    USER_ID?: number;
    GROUP_ID?: number;
    AVATAR?: string;
    CREATOR_ID?: number;
    NAME: number;
    MESSAGE_ID?: string;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "text" | "image";
    CREATE_DATE?: string;
    STATUS?: string;

    constructor(raw: ChatLogViewInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getUserLog(uid: number): Promise<ChatLogViewModel[]> {
        const query = `${SELECT} WHERE "USER_ID" = ?; `;
        
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
}

const SELECT = ` SELECT
"USER_ID",
"GROUP_ID",
"AVATAR",
"CREATOR_ID",
"NAME",
"MESSAGE_ID",
"MESSAGE_BODY",
"MESSAGE_TYPE",
"STATUS",
"CREATE_DATE"
FROM RT."CHATLOG_VIEW"
`