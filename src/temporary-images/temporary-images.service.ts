import { Injectable } from '@nestjs/common';
import { TemporaryImage } from './temporary-images.schema';
import { requestTimeoutException } from 'src/common/errors';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TemporaryImagesService {


    /** Inject the dependencies */
    constructor(
        /**  Inject the TemporaryImage Model */
        @InjectModel(TemporaryImage.name)
        private readonly temporaryImage: Model<TemporaryImage>
    ) { }

    async createTemporaryImage(filename: string): Promise<void> {
        try {
            const tempImage = new this.temporaryImage({ name: filename })
            await tempImage.save()
        } catch (error) {
            throw requestTimeoutException('مشکلی در ذخیره سازی موقت عکس پیش آمده است')
        }
    }

    async deleteTemporaryImagesByNames(filenames: string[]): Promise<void> {
        if (filenames.length == 0) return

        try {
            await this.temporaryImage.deleteMany({
                name: {
                    $in: filenames
                }
            });
        } catch (error) {
            throw requestTimeoutException('مشکلی در پاک کردن عکس موقت پیش آمده است')
        }
    }

    async deleteTemporaryImagesByDate(date: Date): Promise<void> {
        try {
            await this.temporaryImage.deleteMany({
                createdAt: {
                    $lt: date,
                }
            });
        } catch (error) {
            throw requestTimeoutException('مشکلی در پاک کردن عکس موقت پیش آمده است')
        }
    }

    async findOldTemporaryImages(date: Date) {
        try {
            return await this.temporaryImage.find({
                createdAt: {
                    $lt: date,
                },
            }).exec();
        } catch (error) {
            throw requestTimeoutException('مشکلی در پیدا کردن عکس موقت پیش آمده است')
        }
    }
}
