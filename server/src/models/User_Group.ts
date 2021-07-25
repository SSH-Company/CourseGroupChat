import { Client } from 'pg';
import { Database } from '../services/Database';

interface UserGroupInterface {
    ID?: string;
    USER_ID?: string;
    GROUP_ID?: string;
    NAME?: string;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";
    MUTE?: string;
    IGNORE?: "Y" | "N";
    MEMBER_COUNT?: number; //used to store total number of members in group
    AVATAR?: string; //used when joining with RT.GROUP
    CUSTOM_AVATAR?: string; //used when querying for group information
    VERIFIED?: string; //used when joining with RT.GROUP
}

export class UserGroupModel implements UserGroupInterface {
    ID?: string;
    USER_ID?: string;
    GROUP_ID?: string;
    NAME?: string;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";
    MUTE?: string;
    IGNORE?: "Y" | "N";
    MEMBER_COUNT?: number;
    AVATAR?: string;
    CUSTOM_AVATAR?: string; //used when querying for group information
    VERIFIED?: string; //used when joining with RT.GROUP

    constructor(raw: UserGroupInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(userID: string, grpID: string, name?: string, db: Client | Database = Database.getDB()): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO RT.USER_GROUP ("USER_ID", "GROUP_ID", "NAME", "CREATE_DATE", "IS_ACTIVE", "IGNORE") 
                            VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'Y', 'N') ; `
            
            db
            .query(query, [userID, grpID, name])
            .then(() => resolve())
            .catch(err => {
                console.log(err)
                reject(err)
            })
        })
    }

    static getMembers(uid: string): Promise<UserGroupModel[]> {
        const query = `SELECT "USER_ID" FROM RT.USER_GROUP WHERE "GROUP_ID" = ? ;`
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data:UserGroupModel[]) => {
                    resolve(data.map((d: UserGroupInterface) => new UserGroupModel(d)))
                })
                .catch(err => {
                    console.error(err)
                    reject(err)
                })
        })
    }

    static removeFromGroup(users: string[], grpID: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const params = Array(users.length).fill("?").join(",");
            const query = `DELETE FROM RT.USER_GROUP WHERE "USER_ID" IN (${params}) AND "GROUP_ID" = ? ;`
            
            Database.getDB()
                .query(query, users.concat(grpID))
                .then(() => resolve())
                .catch(err => {
                    console.error(err)
                    reject(err)
                })
        })
    }

    static getEnrolledCourses(uid: string): Promise<UserGroupModel[]> {
        const query = `SELECT UG."GROUP_ID", CG."NAME" FROM RT.USER_GROUP UG
                        LEFT JOIN RT."COURSE_GROUPS" CG ON UG."GROUP_ID" = CG."CODE"
                        WHERE CG."CODE" IS NOT NULL AND UG."USER_ID" = ? ;`
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data:UserGroupModel[]) => {
                    resolve(data.map((d: UserGroupInterface) => new UserGroupModel(d)))
                })
                .catch(err => {
                    console.error(err)
                    reject(err)
                })
        })
    }

    static getIgnoredGroups(uid: string): Promise<UserGroupModel[]> {
        const query = `SELECT ug."GROUP_ID", ug."NAME", g."AVATAR"
                        FROM RT.USER_GROUP ug 
                        LEFT JOIN RT.GROUP g ON ug."GROUP_ID" = g."ID"::character varying(10)::text
                        WHERE ug."USER_ID" = ? AND ug."IGNORE" = 'Y' ;`
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data:UserGroupModel[]) => {
                    resolve(data.map((d: UserGroupInterface) => new UserGroupModel(d)))
                })
                .catch(err => {
                    console.error(err)
                    reject(err)
                })
        })
    }

    static muteNotifications(userID: string, groupID: string, timestamp: string | null): Promise<void> {
        const query = `UPDATE RT.USER_GROUP SET "MUTE" = ${timestamp?.length > 0 ? '?' : 'NULL'} 
                        WHERE "USER_ID" = ? AND "GROUP_ID" = ? `;
        const params = timestamp?.length > 0 ? [timestamp, userID, groupID] : [userID, groupID];

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, params)
                .then(() => resolve())
                .catch(err => reject(err)) 
        })
    }

    static ignoreGroup(userID: string, groupID: string, status: "Y" | "N"): Promise<void> {
        const query = `UPDATE RT.USER_GROUP SET "IGNORE" = ? 
                        WHERE "USER_ID" = ? AND "GROUP_ID" = ? `;

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [status, userID, groupID])
                .then(() => resolve())
                .catch(err => reject(err)) 
        })
    }

    static getGroupInformation(uid: string, groupId?: string): Promise<UserGroupModel[]> {
        let query = `SELECT * FROM (SELECT 
            UG."GROUP_ID",
            CASE 
                WHEN (SELECT COUNT(*) FROM RT.USER_GROUP WHERE "GROUP_ID" = UG."GROUP_ID") = '1' THEN UG."NAME"
                ELSE COALESCE(UG."NAME", STRING_AGG(U."FIRST_NAME" || ' ' || U."LAST_NAME", ', '))
            END AS "NAME",
            (SELECT COUNT(*) FROM RT.USER_GROUP UG3 WHERE UG3."GROUP_ID" = UG."GROUP_ID") AS "MEMBER_COUNT",
            CASE
                WHEN (( SELECT COUNT(*) AS COUNT
                    FROM RT."COURSE_GROUPS" CG
                    WHERE CG."CODE"::TEXT = UG."GROUP_ID"::TEXT)) > 0 THEN 'Y'::TEXT
                WHEN (( SELECT COUNT(*) AS COUNT
                    FROM RT.GROUP G
                    WHERE G."ID"::CHARACTER VARYING(10)::TEXT = UG."GROUP_ID"::TEXT)) > 0 THEN 'N'::TEXT
                ELSE NULL::TEXT
            END AS "VERIFIED",
            G2."AVATAR",
            STRING_AGG(U."AVATAR", ', ') AS "CUSTOM_AVATAR",
            UG."MUTE" 
            FROM RT.USER_GROUP UG 
            LEFT JOIN RT.USER U ON UG."USER_ID" = U."ID"
            LEFT JOIN RT.GROUP G2 ON UG."GROUP_ID" = G2."ID"::CHARACTER VARYING(10)::TEXT 
            WHERE (UG."GROUP_ID" IN (SELECT DISTINCT UG2."GROUP_ID" FROM RT.USER_GROUP UG2 WHERE UG2."USER_ID" = ?) AND UG."USER_ID" <> ?)
            OR (UG."GROUP_ID" IN (SELECT DISTINCT CG."CODE" FROM RT."COURSE_GROUPS" CG) AND UG."USER_ID" = ?)
            OR (SELECT COUNT(*) FROM RT.USER_GROUP WHERE "GROUP_ID" = UG."GROUP_ID") = '1' AND UG."USER_ID" = ?
            GROUP BY UG."GROUP_ID", UG."NAME", G2."AVATAR", UG."MUTE"  ) GROUPINFORMATION`

        const params = [uid, uid, uid, uid];
        
        if (groupId) {
            query += ` WHERE GROUPINFORMATION."GROUP_ID" LIKE '${groupId.toUpperCase()}%' `;
        }
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, params)
                .then((data:UserGroupModel[]) => {
                    resolve(data.map((d: UserGroupInterface) => new UserGroupModel(d)))
                })
                .catch(err => {
                    console.error(err)
                    reject(err)
                })
        })
    }
}


