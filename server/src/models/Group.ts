import { Database } from '../services/Database';

interface GroupInterface {
    ID?: number;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";
}

export class GroupModel implements GroupInterface {
    ID?: number;
    CREATE_DATE?: string;
    IS_ACTIVE?: "Y" | "N";

    constructor(raw: GroupInterface) {
        // super();
        Object.assign(this, raw);
    }
}