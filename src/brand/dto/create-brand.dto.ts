import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import messages from "src/common/dto.messages";

const nameFADoc = {
    description: 'Farsi Name of the brand, should be a non-empty string',
    type: String,
    example: 'بلو شنل'
}

const nameENDoc = {
    description: 'English Name of the brand, should be a non-empty string',
    type: String,
    example: 'bleu de chanel'
}

const imageKeyDoc = {
    description: 'the imageKey of the brand',
    type: String,
    example: '1745851214101_197232-3840x2160-desktop-4k-cat-wallpaper.jpg'
}

export class CreateBrandDto {
    @ApiProperty(nameFADoc)
    @IsString(messages.isString('نام فارسی برند'))
    @IsNotEmpty(messages.notEmpty('نام فارسی برند'))
    nameFA: string;

    @ApiProperty(nameENDoc)
    @IsString(messages.isString('نام انگلیسی برند'))
    @IsNotEmpty(messages.notEmpty('نام انگلیسی برند'))
    nameEN: string;

    @ApiProperty(imageKeyDoc)
    @IsString(messages.isString('عکس برند'))
    @IsNotEmpty(messages.notEmpty('عکس برند'))
    imageKey: string;
}
