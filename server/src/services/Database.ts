import { Pool, Client } from 'pg';
import { Config } from './Config';
import { Exception } from './Exception';

export class Database {
    private static instance: Database;
    private static refreshTime: Date;
    public readonly pool: Pool;

    private constructor() {
        let config = Config.getConfig().db;
        this.pool = new Pool({
            user: config.UID,
            host: config.HOST,
            database: config.DB,
            password: config.PWD,
            port: config.PORT
        })
    }

    //set refresh time to be 15 mins later
    private static refreshConnectionTime = () => {
        const currentTime = new Date();
        Database.refreshTime = new Date(currentTime.getTime() + 15 * 60000)
    }

    public static getDB(): Database {
        if (!Database.instance || !Database.refreshTime || new Date() > Database.refreshTime) {
            if (Database.instance) {
                console.log('try to close pool')
                Database.instance.pool.end(() => {
                    console.log('closed db pool')
                })
            }
            console.log('reset Database instance');
            Database.instance = new Database();
            Database.refreshConnectionTime();
        }

        return Database.instance;
    }

    public transaction(cb: (client: Client) => Promise<any>): Promise<void> {
        console.log('Running transaction');
        return new Promise(async (resolve, reject) => {
            this.pool.connect(async (err, client, release) => {
                if (err) {
                    const error = new Exception({
                        message: "Failed to open database connection" + err.message,
                        identifier: "DB001",
                        trace: err
                    });
                    console.log(error);
                    reject(error);
                    return;
                }

                //Override client.query to prepare statement first
                (client.query as (query: string, params?: any[]) => Promise<any>) = (query: string, params: any[] = []) => {
                    return new Promise((resolve, reject) => {
                        var cleanedStmt = query.trim().toUpperCase();
                
                        //Replace all ? with $count
                        for (var s = 1; s <= params.length; s++) {
                            cleanedStmt = cleanedStmt.replace('?', `$${s}`) 
                        }

                        client.queryOverride(cleanedStmt, params)
                            .then(res => {
                                Database.refreshConnectionTime();
                                resolve(res.rows)
                            })
                            .catch(err => reject(err))
                    })
                }

                try {
                    await client.query('BEGIN');
                    await cb(client);
                    await client.query('COMMIT');
                    resolve();
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.log('Error occurred during DB transaction, see below for more information')
                    const error = new Exception({
                        message: err.message ? err.message : "Error during DB transaction, rolling back transaction",
                        identifier: "DB002",
                        trace: err
                    });
                    console.log(error);
                    reject(error);
                } finally {
                    release();
                    this.pool.end(() => {
                        console.log('closed db pool')
                    })
                    Database.instance = null;
                }
            })
        }) 
    }

    public query(stmt: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pool.connect(async (err, client, release) => {
                if (err) {
                    const error = new Exception({
                        message: "Failed to open database connection" + err.message,
                        identifier: "DB0003",
                        trace: err
                    });
                    console.log(error);
                    reject(error);
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
                } catch(err) {
                    reject({message: err});
                } finally {
                    release();
                }
            })
        })
    }
}