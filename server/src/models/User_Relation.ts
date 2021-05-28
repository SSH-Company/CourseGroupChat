import { Database } from '../services/Database';

interface UserRelationInterface {
    USER_ONE?: string;
    USER_ONE_FIRST_NAME?: string;
    USER_ONE_LAST_NAME?: string;
    USER_ONE_AVATAR?: string;
    USER_TWO?: string;
    USER_TWO_FIRST_NAME?: string;
    USER_TWO_LAST_NAME?: string;
    USER_TWO_AVATAR: string;
    STATUS?: string;
}

export class UserRelationModel implements UserRelationInterface {
    USER_ONE?: string;
    USER_ONE_FIRST_NAME?: string;
    USER_ONE_LAST_NAME?: string;
    USER_ONE_AVATAR?: string;
    USER_TWO?: string;
    USER_TWO_FIRST_NAME?: string;
    USER_TWO_LAST_NAME?: string;
    USER_TWO_AVATAR: string;
    STATUS?: string;

    constructor(raw: UserRelationInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getUserRelation(uid: number): Promise<UserRelationModel[]> {
        const query = `
        SELECT * FROM RT."USER_RELATION"
        WHERE "USER_ONE" = ? ;`

        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data: UserRelationInterface[]) => resolve(data.map(d => new UserRelationModel(d))))
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }
}


