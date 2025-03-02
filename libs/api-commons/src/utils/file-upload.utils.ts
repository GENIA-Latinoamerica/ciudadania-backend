import { S3 } from 'aws-sdk';
import { Logger, Injectable } from '@nestjs/common';
import { S3Entity } from '../dtos/s3-item.dto';

@Injectable()
export class FileUploadUtils {

    async upload(file, name): Promise<S3Entity> {
        const { originalname } = file;
        const fileArray = String(originalname).split('.');
        const ext = fileArray[fileArray.length - 1];
        name = `${name}.${ext}`
        const bucketS3 = 'genia-bucket';
        return await this.uploadS3(file.buffer, bucketS3, name);
    }

    async uploadS3(file, bucket, name): Promise<S3Entity> {
        const s3 = this.getS3();
        const params = {
            Bucket: bucket,
            Key: String(name),
            Body: file,
        };
        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
            if (err) {
                Logger.error(err);
                reject(err.message);
            }
            resolve(data);
            });
        });
    }

    getS3() {
        return new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }
}