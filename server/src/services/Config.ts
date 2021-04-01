import _config from 'config';

interface DBConfig {
    HOST: string,
    DB: string,
    UID: string,
    PWD: string,
    PORT: number
}

export class Config {
    private static instance: Config;

    private constructor() {
        this.db = {
            HOST: _config.get("db.HOST"),
            DB: _config.get("db.DB"),
            PORT: _config.get("db.PORT"),
            UID: _config.get("db.UID"),
            PWD: _config.get("db.PWD")
        }
    }

    public db: DBConfig;

    public static getConfig(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
}