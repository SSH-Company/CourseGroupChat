import * as AWS from 'aws-sdk';
import { Config } from './Config';

export class Bucket {
    private static instance: Bucket;
    public readonly bucket: AWS.S3;

    private constructor() {
        let config = Config.getConfig().s3;
        this.bucket = new AWS.S3({
            accessKeyId: config.ID,
            secretAccessKey: config.SECRET
        })
    }

    public static getBucket(): Bucket {
        if (!Bucket.instance) {
            Bucket.instance = new Bucket()
        }
        return Bucket.instance;
    }
}