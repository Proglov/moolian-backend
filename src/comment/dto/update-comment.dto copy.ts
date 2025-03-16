import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';
import messages from 'src/common/dto.messages';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { idDocGenerator } from 'src/common/findOne.dto';



const validatedDoc = {
    description: 'Body of the comment, should be a non-empty string',
    type: Boolean,
    example: 'body'
}

const disLikeIdsDoc = {
    description: 'DisLikeIds of the comment, must be a non-empty array of ids',
    type: String,
    isArray: true,
    example: ['67cd7baedb92fc567e9df356', '67cd7baedb92fc567e9df356']
}

const likeIdsDoc = {
    description: 'LikeIds of the comment, must be a non-empty array of ids',
    type: String,
    isArray: true,
    example: ['67cd7baedb92fc567e9df356', '67cd7baedb92fc567e9df356']
}


export class UpdateCommentDto extends PartialType(CreateCommentDto) {

    @ApiProperty(idDocGenerator('userId', 'comment'))
    @IsString(messages.isString('آیدی کاربر کامنت'))
    @IsNotEmpty(messages.notEmpty('آیدی کاربر کامنت'))
    userId: string;

    @ApiProperty(validatedDoc)
    @IsString(messages.isString('تاییدیه کامنت'))
    @IsNotEmpty(messages.notEmpty('تاییدیه کامنت'))
    validated?: boolean = false;

    @ApiProperty(disLikeIdsDoc)
    @IsString({ each: true, ...messages.isString('آیدی های کاربران لایک کننده کامنت') })
    @IsArray(messages.isArray('آیدی های کاربران لایک کننده کامنت'))
    @ArrayNotEmpty(messages.notEmpty('آیدی های کاربران لایک کننده کامنت'))
    disLikeIds?: string[] = [];

    @ApiProperty(likeIdsDoc)
    @IsString({ each: true, ...messages.isString('آیدی های کاربران لایک کننده کامنت') })
    @IsArray(messages.isArray('آیدی های کاربران لایک کننده کامنت'))
    @ArrayNotEmpty(messages.notEmpty('آیدی های کاربران لایک کننده کامنت'))
    likeIds?: string[] = [];
}
