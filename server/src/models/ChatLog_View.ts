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
        const query = `${SELECT} WHERE "USER_ID" = ? AND "VERIFIED" IS NOT NULL; `;
        
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
"VERIFIED",
"AVATAR",
"CREATOR_ID",
"CREATOR_NAME",
"NAME",
"MESSAGE_ID",
"MESSAGE_BODY",
"MESSAGE_TYPE",
"STATUS",
"CREATE_DATE"
FROM RT."CHATLOG_VIEW"
`