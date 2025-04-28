import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";
import messages from "src/common/dto.messages";
import { idDocGenerator } from "src/common/findOne.dto";


const titleDoc = {
    description: 'Title of the article, should be a non-empty string',
    type: String,
    example: 'title'
}

const contentDoc = {
    description: 'Content of the article, should be a non-empty string (html)',
    type: String,
    example: '<h1>hi!<h1>'
}

const tagsDoc = {
    description: 'Tags of the article, should be an array of strings',
    type: String,
    isArray: true,
    example: ['perfume', 'Creed Aventus']
}

const imageKeyDoc = {
    description: 'ImageKey of the product, must be a non-empty string',
    type: String,
    example: '1745851214101_197232-3840x2160-desktop-4k-cat-wallpaper.jpg'
}

const productIdsDoc = {
    description: 'ProductIds of the product, must be an array of strings',
    type: String,
    isArray: true,
    example: ['67d80a025776f2ae1628725a', '67d953efbc7a803b1b24c58c']
}

export class CreateArticleDto {
    @ApiProperty(titleDoc)
    @IsString(messages.isString('نام مجله'))
    @IsNotEmpty(messages.notEmpty('نام مجله'))
    title: string;

    @ApiProperty(contentDoc)
    @IsString(messages.isString('محتوای مجله'))
    @IsNotEmpty(messages.notEmpty('محتوای مجله'))
    content: string;

    @ApiProperty(tagsDoc)
    @IsArray(messages.isArray('تگ ها'))
    tags: string[];

    @ApiProperty(imageKeyDoc)
    @IsString(messages.isString('عکس مجله'))
    @IsNotEmpty(messages.notEmpty('عکس مجله'))
    imageKey: string;

    @ApiProperty(productIdsDoc)
    @IsString({ ...messages.isString('آیدی محصولات مجله'), each: true })
    @IsArray(messages.isArray('آیدی محصولات مجله'))
    productIds: Types.ObjectId[];
}
