import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';

const passwordDoc = {
    description: 'Password of the user, should be a non-empty string between 8 and 15 characters',
    type: String,
    example: 'ab12345678'
}

const currentPasswordDoc = {
    description: 'current Password of the user, should be a non-empty string between 8 and 15 characters',
    type: String,
    example: 'ab12345678'
}

export class ChangePasswordDto {
    @ApiProperty(currentPasswordDoc)
    @IsString(messages.isString('رمز عبور فعلی'))
    @IsNotEmpty(messages.notEmpty('رمز عبور فعلی'))
    currentPassword: string;

    @ApiProperty(passwordDoc)
    @IsString(messages.isString('رمز عبور'))
    @IsNotEmpty(messages.notEmpty('رمز عبور'))
    password: string;
}