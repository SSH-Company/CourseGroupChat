import { Database } from '../services/Database';

interface CommonGroupsInterface {
    CODES?: string;
    NAMES?: string;
}

export class CommonGroupsModel implements CommonGroupsInterface {
    CODES?: string;
    NAMES?: string;

    constructor(raw: CommonGroupsInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getMutualCourseGroups(userOne: string, userTwo: string): Promise<CommonGroupsModel[]> {
        return new Promise((resolve, reject) => {
            const query = `select "CODES", "NAMES" from rt."COMMON_GROUPS"
            where "USER_ONE" = ? and "USER_TWO" = ?`
            Database.getDB()
                .query(query, [userOne, userTwo])
                .then((data: CommonGroupsInterface[]) => resolve(data.map(d => new CommonGroupsModel(d))))
                .catch(err => reject(err))
        })
    }
}