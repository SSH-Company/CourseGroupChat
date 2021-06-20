import { Client } from 'pg';
import { Database } from '../services/Database';

interface AccountVerificationInterface {
    USER_ID?: string;
    VERIFICATION_ID?: string;
    CREATE_DATE?: string;
}

export class AccountVerificationModel implements AccountVerificationInterface {
    USER_ID?: string;
    VERIFICATION_ID?: string;
    CREATE_DATE?: string;

    constructor(raw: AccountVerificationInterface) {
        // super();
        Object.assign(this, raw);
    }

    static insert(account: AccountVerificationModel): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO RT.ACCOUNT_VERIFICATION ("USER_ID", "VERIFICATION_ID", "CREATE_DATE") VALUES (?, ?, CURRENT_TIMESTAMP) ;`
            const params = [account.USER_ID, account.VERIFICATION_ID]
            Database.getDB()
                .query(query, params)
                .then(() => resolve())
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getUserAccountByID(uid: string): Promise<AccountVerificationModel | null> {
        const query = `SELECT * FROM RT.ACCOUNT_VERIFICATION WHERE "USER_ID" = ?;`
        
        return new Promise((resolve, reject) => {
            Database.getDB()
                .query(query, [uid])
                .then((data:AccountVerificationInterface[]) => {
                    if (data.length === 0) {
                        reject(null)
                    }
                    resolve(new AccountVerificationModel(data[0]))
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static deleteByUserId(uid: string, db: Client | Database = Database.getDB()): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM RT.ACCOUNT_VERIFICATION WHERE "USER_ID" = ? ;`
            db.query(query, [uid])
                .then(() => resolve())
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }
}