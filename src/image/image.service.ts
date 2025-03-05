import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as sharp from 'sharp';
import { requestTimeoutException } from 'src/common/errors';
import s3StorageConfig from 'src/configs/s3Storage.config';


/** Class to preform operations related to uploading images */
@Injectable()
export class ImageService {

    // S3 instance
    private readonly s3 = new S3Client({
        region: "default",
        endpoint: this.s3StorageConfiguration.endpoint,
        credentials: {
            accessKeyId: this.s3StorageConfiguration.access,
            secretAccessKey: this.s3StorageConfiguration.secret,
        },
    })

    /** Inject the dependencies */
    constructor(
        /**  Inject the config service */
        @Inject(s3StorageConfig.KEY)
        private readonly s3StorageConfiguration: ConfigType<typeof s3StorageConfig>,
    ) { }

    async uploadImage(filename: string, mimetype: string, file: Buffer): Promise<string> {
        try {
            // resize
            const newBuffer = await sharp(file).resize({ height: 600, width: 800, fit: "cover" }).toBuffer()
            //name
            const imageName = Date.now() + "_" + filename
            const params = {
                Body: newBuffer,
                Bucket: this.s3StorageConfiguration.bucketName,
                Key: imageName,
                ContentType: mimetype
            };
            await this.s3.send(new PutObjectCommand(params));
            return imageName
        } catch (error) {
            throw requestTimeoutException('مشکلی در ذخیره سازی عکس رخ داد')
        }
    }
}
