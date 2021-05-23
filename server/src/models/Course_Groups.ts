import { Database } from '../services/Database';

interface CourseGroupsInterface {
    CODE?: string;
    NAME?: string;
    CREATE_DATE?: string;
    AVATAR?: string;
}

export class CourseGroupsModel implements CourseGroupsInterface {
    CODE?: string;
    NAME?: string;
    CREATE_DATE?: string;
    AVATAR?: string;

    constructor(raw: CourseGroupsInterface) {
        // super();
        Object.assign(this, raw);
    }

    static getAllGroups(): Promise<CourseGroupsModel[]> {
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(SELECT)
                .then((data: CourseGroupsInterface[]) => resolve(data.map(d => new CourseGroupsModel(d))))
                .catch(err => reject(err))
        })
    }
}

const SELECT = `SELECT 
"CODE",
"NAME",
"CREATE_DATE",
"AVATAR"
FROM rt."COURSE_GROUPS" cg
`