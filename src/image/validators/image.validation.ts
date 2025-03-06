import { Injectable, PipeTransform } from '@nestjs/common';
import { extname } from 'path';
import { badRequestException } from 'src/common/errors';

export function getFileValidator(): PipeTransform {
    return new ParseFilePipeDocument();
}

@Injectable()
export class ParseFilePipeDocument implements PipeTransform {
    private readonly allowedExtensions = ['.png', '.jpeg', '.jpg'];
    private readonly acceptedSize = 4_000_000;
    private readonly acceptedSizeInFarsi = '4 مگابایت';

    transform(value: Express.Multer.File): Express.Multer.File {
        if (!value)
            throw badRequestException(`عکس الزامی میباشد`)
        if (value.size > this.acceptedSize)
            throw badRequestException(`سایز فایل ارسالی نباید بیش از ${this.acceptedSizeInFarsi} باشد`)

        const extension = extname(value.originalname);
        if (!this.allowedExtensions.includes(extension)) {
            throw badRequestException('تایپ فایل ارسالی باید یکی از png jpeg jpg باشد ');
        }
        return value;
    }

}