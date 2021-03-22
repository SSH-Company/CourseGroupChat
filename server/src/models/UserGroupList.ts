import { Database } from '../services/Database';

interface UserGroupListInterface {
    USER_ID: string,
    CODE: string,
    NAME: string,
    AVATAR: string,
    VERIFIED: 'Y' | 'N'
}

export class UserGroupListModel implements UserGroupListInterface {
    USER_ID: string;
    CODE: string;
    NAME: string;
    AVATAR: string;
    VERIFIED: 'Y' | 'N';

    constructor(raw: UserGroupListInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getUserGroupSearchList(uid: number): Promise<UserGroupListModel[]> {
        const query = `${SELECT} WHERE "USER_ID" = ? or ("CODE" is not null and "USER_ID" is null); `;
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data: UserGroupListInterface[]) => resolve(data.map(d => new UserGroupListModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }
}

const SELECT = ` SELECT
"USER_ID",
"CODE",
"NAME",
"AVATAR",
"VERIFIED"
FROM RT."USER_GROUP_LIST"
`