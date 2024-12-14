import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';

const usernameDoc = {
    description: 'Username of the user, should be a non-empty string',
    type: String,
}

const passwordDoc = {
    description: 'Password of the user, should be a non-empty string',
    type: String,
}

const emailDoc = {
    description: 'Email of the user, must be a valid email format and non-empty',
    type: String,
}

const nameDoc = {
    description: 'Name of the user, must be a non-empty string',
    type: String,
    required: false
}

const addressDoc = {
    description: 'Address of the user, must be a non-empty array of strings',
    type: String,
    required: false,
    isArray: true
}

const phoneDoc = {
    description: 'phone number of the user, must be a non-empty string',
    example: '09123456789',
    type: String
}


export class CreateUserDto {
    @ApiProperty(usernameDoc)
    @IsString(messages.isString('نام کاربری'))
    @IsNotEmpty(messages.notEmpty('نام کاربری'))
    @MaxLength(...messages.max('نام کاربری', 15))
    @MinLength(...messages.min('نام کاربری', 8))
    username: string;

    @ApiProperty(emailDoc)
    @IsEmail(...messages.email())
    @IsNotEmpty(messages.notEmpty('ایمیل'))
    email: string;

    @ApiProperty(passwordDoc)
    @IsString(messages.isString('رمز عبور'))
    @IsNotEmpty(messages.notEmpty('رمز عبور'))
    password: string;


    @ApiProperty(nameDoc)
    @IsString(messages.isString('نام کاربر'))
    @IsOptional()
    name?: string;


    @ApiProperty(addressDoc)
    @IsArray(messages.isString('آدرس'))
    @IsString({ each: true, ...messages.isString('آدرس') })
    @IsOptional()
    address?: string[];


    @ApiProperty(phoneDoc)
    @IsString(messages.isString('شماره همراه'))
    @IsNotEmpty(messages.notEmpty('شماره همراه'))
    @Matches(...messages.phone())
    phone: string;
}