import _config from 'config';

interface DBConfig {
    HOST: string,
    DB: string,
    UID: string,
    PWD: string,
    PORT: number
}

interface RabbitConfig {
    protocol: string,
    hostname: string,
    port: number,
    username: string,
    password: string,
    locale: string,
    queue: string
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
        this.rabbit = {
            protocol: _config.get("db.protocol"),
            hostname: _config.get("db.hostname"),
            port: _config.get("db.port"),
            username: _config.get("db.username"),
            password: _config.get("db.password"),
            locale: _config.get("db.locale"),
            queue: _config.get("db.queue")
        }
    }

    public db: DBConfig;
    public rabbit: RabbitConfig;

    public static getConfig(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
}