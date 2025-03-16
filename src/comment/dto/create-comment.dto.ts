import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import messages from "src/common/dto.messages";
import { idDocGenerator } from "src/common/findOne.dto";

const bodyDoc = {
    description: 'Body of the comment, should be a non-empty string',
    type: String,
    example: 'body'
}


export class CreateCommentDto {
    @ApiProperty(bodyDoc)
    @IsString(messages.isString('متن کامنت'))
    @IsNotEmpty(messages.notEmpty('متن کامنت'))
    body: string;

    @ApiProperty(idDocGenerator('productId', 'comment'))
    @IsString(messages.isString('آیدی محصول کامنت'))
    @IsNotEmpty(messages.notEmpty('آیدی محصول کامنت'))
    productId: string;

    @ApiPropertyOptional(idDocGenerator('parentCommentId', 'comment'))
    @IsString(messages.isString('آیدی کامنت پدر این کامنت'))
    @IsOptional()
    parentCommentId?: string = null;
}
