import { Database } from '../services/Database';

//TODO: this view isn't connected to anything yet, might need to get rid of it later
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
}

const SELECT = `SELECT 
"CODE",
"NAME",
"CREATE_DATE",
"AVATAR"
FROM rt."COURSE_GROUPS" cg
`