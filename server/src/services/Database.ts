import { Pool } from 'pg';

export class Database {
    private static instance: Database;
    public readonly pool: Pool;

    private constructor() {
        this.pool = new Pool({
            user: 'dbinst',
            host: 'localhost',
            database: 'api',
            password: 'password',
            port: 5432
        })
    }

    public static getDB(): Database {
        if (!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance;
    }

    public query(stmt: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pool.connect(async (err, client, release) => {
                if (err) {
                    reject({message: err});
                    return;
                }

                var cleanedStmt = stmt.trim().toUpperCase();
                
                //Replace all ? with $count
                for (var s = 1; s <= params.length; s++) {
                    cleanedStmt = cleanedStmt.replace('?', `$${s}`) 
                }

                try {
                    const res = await client.query(cleanedStmt, params);
                    resolve(res.rows);
                    client.release(true);
                    return;

                } catch(err) {
                    reject({message: err});
                    client.release(true);
                    return;
                }
            })
        })
    }
}