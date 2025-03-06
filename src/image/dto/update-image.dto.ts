import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';

const filenameDoc = {
    description: 'key of the image, should be a non-empty string',
    type: String,
    example: '1741258235029_Untitled.jpg'
}

export class UpdateImageDto {
    @ApiProperty(filenameDoc)
    @IsString(messages.isString('نام فایل'))
    @IsNotEmpty(messages.notEmpty('نام فایل'))
    filename: string;
}