import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';
import { idDocGenerator } from 'src/common/findOne.dto';
import { Types } from 'mongoose';

const tokenDoc = {
    description: 'token, should be a non-empty string',
    type: String,
    example: 'token123'
}


export class VerifyEmailOTPDto {
    @ApiProperty(idDocGenerator('userId', 'user'))
    @IsString(messages.isString('آیدی کاربر'))
    @IsNotEmpty(messages.notEmpty('آیدی کاربر'))
    userId: Types.ObjectId;

    @ApiProperty(tokenDoc)
    @IsString(messages.isString('توکن'))
    @IsNotEmpty(messages.notEmpty('توکن'))
    token: string;
}