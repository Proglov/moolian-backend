import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as sharp from 'sharp';
import { requestTimeoutException } from 'src/common/errors';
import s3StorageConfig from 'src/configs/s3Storage.config';
import { TemporaryImagesService } from 'src/temporary-images/temporary-images.service';


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

    private readonly bucketName = this.s3StorageConfiguration.bucketName

    /** Inject the dependencies */
    constructor(
        /**  Inject the config service */
        @Inject(s3StorageConfig.KEY)
        private readonly s3StorageConfiguration: ConfigType<typeof s3StorageConfig>,

        /**  Inject the temporary-images service */
        private readonly temporaryImagesService: TemporaryImagesService
    ) { }

    async resizeImage(file: Buffer): Promise<Buffer> {
        return sharp(file).resize({ height: 600, width: 800, fit: "cover" }).toBuffer()
    }

    async uploadImage(filename: string, mimetype: string, file: Buffer): Promise<string> {
        try {
            // resize
            const newBuffer = await this.resizeImage(file)
            //name
            const imageName = Date.now() + "_" + filename
            const params = {
                Body: newBuffer,
                Bucket: this.bucketName,
                Key: imageName,
                ContentType: mimetype
            };
            await this.s3.send(new PutObjectCommand(params));

            //add the image to the temporary images
            await this.temporaryImagesService.createTemporaryImage(imageName)
            return imageName
        } catch (error) {
            throw requestTimeoutException('مشکلی در ذخیره سازی عکس رخ داد')
        }
    }

    async getImage(filename: string): Promise<string> {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: filename,
            };

            const command = new GetObjectCommand(params);
            const url = await getSignedUrl(this.s3, command);
            return url
        } catch (error) {
            throw requestTimeoutException('مشکلی در دریافت عکس رخ داد')
        }
    }

    async getImages(filenames: string[]): Promise<string[]> {
        try {
            // Wait for all promises to resolve
            const urls = await Promise.all(filenames.map(filename => this.getImage(filename)));
            return urls;
        } catch (error) {
            throw requestTimeoutException('مشکلی در دریافت عکس ها رخ داد')
        }
    }

    async deleteImage(filename: string): Promise<void> {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: filename,
            };
            await this.s3.send(new DeleteObjectCommand(params));
        } catch (error) {
            throw requestTimeoutException('مشکلی در پاکسازی عکس رخ داد')
        }

    }

    //? this is the best practice for using the deleteImages. but the @aws-sdk/client-s3 has a problem probably
    // async deleteImages(filenames: string[]): Promise<void> {
    //     try {
    //         const files2Delete = [];
    //         filenames.map(filename => files2Delete.push({ Key: filename }))
    //         const params = {
    //             "Bucket": this.bucketName,
    //             "Delete": {
    //                 "Objects": files2Delete
    //             },
    //         };
    //         await this.s3.send(new DeleteObjectsCommand(params));
    //     } catch (error) {
    //         throw requestTimeoutException('مشکلی در پاکسازی عکس ها رخ داد')
    //     }

    // }
    //! this is not the best practice, but it is only thing we got right now
    async deleteImages(filenames: string[]): Promise<void> {
        try {
            await Promise.all(filenames.map(filename => this.deleteImage(filename)));
        } catch (error) {
            throw requestTimeoutException('مشکلی در پاکسازی عکس ها رخ داد')
        }

    }

    async deleteOldTemporaryImages(): Promise<void> {
        try {
            const date = new Date()
            date.setHours(date.getHours() - 3)   // clear the temp images which created before 3 hours ago
            const files = await this.temporaryImagesService.findOldTemporaryImages(date)
            const filenames = files.map(obj => obj.name)

            await this.deleteImages(filenames)
            await this.temporaryImagesService.deleteTemporaryImagesByDate(date)
        } catch (error) {
            throw requestTimeoutException('مشکلی در پاکسازی عکس ها رخ داد')
        }
    }

    async checkIfFileExists(filename: string): Promise<boolean> {
        try {
            const headParams = {
                Bucket: this.bucketName,
                Key: filename
            };
            await this.s3.send(new HeadObjectCommand(headParams)); // This checks if the object exists
            return true
        } catch (error) {
            throw requestTimeoutException('فایل مورد نظر یافت نشد')
        }
    }

    async updateImage(filename: string, file: Buffer): Promise<void> {
        //check If File Exists
        await this.checkIfFileExists(filename)

        try {
            // resize
            const newBuffer = await this.resizeImage(file)

            const params = {
                Body: newBuffer,
                Bucket: this.bucketName,
                Key: filename,
            };
            await this.s3.send(new PutObjectCommand(params));
        } catch (error) {
            throw requestTimeoutException('مشکلی در آپدیت عکس رخ داد')
        }
    }
}
