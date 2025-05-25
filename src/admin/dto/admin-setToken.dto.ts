import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';

const tokenDoc = {
    description: 'NotificationToken, should be a non-empty string',
    type: String,
    example: 'token123'
}


export class SetAdminTokenDto {
    @ApiProperty(tokenDoc)
    @IsString(messages.isString('توکن'))
    @IsNotEmpty(messages.notEmpty('توکن'))
    token: string;
}