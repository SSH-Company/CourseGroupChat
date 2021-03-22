import { Database } from '../services/Database';

interface GroupInterface {
    ID?: string;
    CREATE_DATE?: string;
    AVATAR?: string;
    IS_ACTIVE?: "Y" | "N";
}

export class GroupModel implements GroupInterface {
    ID?: string;
    CREATE_DATE?: string;
    AVATAR?: string;
    IS_ACTIVE?: "Y" | "N";

    constructor(raw: GroupInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(avatar: string): Promise<GroupModel> {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO RT.GROUP ("AVATAR", "CREATE_DATE", "IS_ACTIVE") VALUES (?, CURRENT_TIMESTAMP, 'Y') RETURNING * ;`
            Database.getDB()
                .query(query, [avatar])
                .then((data:GroupModel[]) => {
                    resolve(new GroupModel(data[0]))
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }
}