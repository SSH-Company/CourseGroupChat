import { Database } from '../services/Database';

interface ChatLogViewInterface {
    USER_ID?: string;
    GROUP_ID?: string;
    VERIFIED?: 'Y' | 'N';
    AVATAR?: string;
    CREATOR_ID?: string;
    CREATOR_NAME?: string;
    CREATOR_AVATAR?: string;
    NAME: string;
    MESSAGE_ID?: string;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "text" | "image" | "video" | "file" | "audio";
    LOCATION?: string;
    CREATE_DATE?: string;
    STATUS?: string;
    MUTE_NOTIFICATION?: string;
    IGNORE?: "Y" | "N"
}

export class ChatLogViewModel implements ChatLogViewInterface {
    USER_ID?: string;
    GROUP_ID?: string;
    VERIFIED?: 'Y' | 'N';
    AVATAR?: string;
    CREATOR_ID?: string;
    CREATOR_NAME?: string;
    CREATOR_AVATAR?: string;
    NAME: string;
    MESSAGE_ID?: string;
    MESSAGE_BODY?: string;
    MESSAGE_TYPE?: "text" | "image" | "video" | "file" | "audio";
    LOCATION?: string;
    CREATE_DATE?: string;
    STATUS?: string;
    MUTE_NOTIFICATION?: string;
    IGNORE?: "Y" | "N"

    constructor(raw: ChatLogViewInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getMessageLog(userID: string, groupID: string, rowCount?: string): Promise<ChatLogViewModel[]> {
        const query = `SELECT * FROM RT."CHATLOG_VIEW" CV
                        WHERE CV."GROUP_ID" = ? AND CV."USER_ID" = ?
                        ORDER BY CV."CREATE_DATE" DESC
                        FETCH FIRST ? ROWS ONLY;`

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [groupID, userID, rowCount || 21])
                .then((data: ChatLogViewInterface[]) => resolve(data.map(d => new ChatLogViewModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getFirstMessageId(userID: string, groupID: string): Promise<string> {
        const query = `SELECT "MESSAGE_ID" FROM RT."CHATLOG_VIEW" CV
                        WHERE CV."GROUP_ID" = ? AND CV."USER_ID" = ?
                        ORDER BY CV."CREATE_DATE"
                        FETCH FIRST 1 ROWS ONLY;`

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [groupID, userID])
                .then((data: ChatLogViewInterface[]) => resolve(data[0].MESSAGE_ID))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getAllGroups(userID: string): Promise<ChatLogViewModel[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT DISTINCT "GROUP_ID", "NAME", "AVATAR", "VERIFIED" FROM RT."CHATLOG_VIEW" CV
                            WHERE "USER_ID" = ?;`
            Database.getDB()
                .query(query, [userID])
                .then((data: ChatLogViewInterface[]) => resolve(data.map(d => new ChatLogViewModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getGroupByUser(userID: string, groupID: string): Promise<ChatLogViewModel[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT DISTINCT "GROUP_ID", "NAME", "AVATAR", "VERIFIED", "MUTE_NOTIFICATION" FROM RT."CHATLOG_VIEW" CV
                            WHERE "USER_ID" = ? AND "GROUP_ID" = ?;`
            Database.getDB()
                .query(query, [userID, groupID])
                .then((data: ChatLogViewInterface[]) => resolve(data.map(d => new ChatLogViewModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getMainPageList(userID: string): Promise<ChatLogViewModel[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM
                    (SELECT
                        "USER_ID",
                        "GROUP_ID",
                        "VERIFIED",
                        "AVATAR",
                        "CREATOR_ID",
                        "CREATOR_NAME",
                        "CREATOR_AVATAR",
                        "NAME",
                        "MESSAGE_ID",
                        "MESSAGE_BODY",
                        "MESSAGE_TYPE",
                        "LOCATION",
                        "STATUS",
                        "CREATE_DATE",
                        "MUTE_NOTIFICATION",
                        ROW_NUMBER() OVER (PARTITION BY CV."GROUP_ID" ORDER BY CV."CREATE_DATE" DESC) AS ROW_ID
                    FROM RT."CHATLOG_VIEW" CV
                    WHERE "USER_ID" = ?) CHATLOG
                    WHERE ROW_ID = '1' ORDER BY "CREATE_DATE" DESC`
            Database.getDB()
                .query(query, [userID])
                .then((data: ChatLogViewInterface[]) => resolve(data.map(d => new ChatLogViewModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }
}


