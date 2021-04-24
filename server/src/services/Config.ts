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

interface S3Config {
    ID: string,
    SECRET: string,
    BUCKET_NAME: string,
    REGION: string
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
            protocol: _config.get("rabbit.protocol"),
            hostname: _config.get("rabbit.hostname"),
            port: _config.get("rabbit.port"),
            username: _config.get("rabbit.username"),
            password: _config.get("rabbit.password"),
            locale: _config.get("rabbit.locale"),
            queue: _config.get("rabbit.queue")
        },
        this.s3 = {
            ID: _config.get("s3.ID"),
            SECRET: _config.get("s3.SECRET"),
            BUCKET_NAME: _config.get("s3.BUCKET_NAME"),
            REGION: _config.get("s3.REGION")
        }
    }

    public db: DBConfig;
    public rabbit: RabbitConfig;
    public s3: S3Config;

    public static getConfig(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
}