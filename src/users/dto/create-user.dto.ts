import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, Validate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';
import { IsNotEmail } from 'src/auth/decorators/IsNotEmail.decorator';
import { Transform } from 'class-transformer';

const usernameDoc = {
    description: 'Username of the user, should be a non-empty string',
    type: String,
    example: 'username123'
}

const passwordDoc = {
    description: 'Password of the user, should be a non-empty string between 8 and 15 characters',
    type: String,
    example: 'ab12345678'
}

const emailDoc = {
    description: 'Email of the user, must be a valid email format and non-empty',
    type: String,
    example: 'email@em.ail'
}

const nameDoc = {
    description: 'Name of the user, must be a non-empty string',
    type: String,
    example: 'name am'
}

const addressDoc = {
    description: 'Address of the user, must be a non-empty array of strings',
    type: String,
    isArray: true,
    example: ['تهران']
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
    @MaxLength(...messages.maxLength('نام کاربری', 15))
    @MinLength(...messages.minLength('نام کاربری', 8))
    @Validate(IsNotEmail, [{ message: 'نام کاربری نمی‌تواند ایمیل باشد!' }])
    username: string;

    @ApiProperty(emailDoc)
    @IsEmail(...messages.email())
    @IsNotEmpty(messages.notEmpty('ایمیل'))
    @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
    email: string;

    @ApiProperty(passwordDoc)
    @IsString(messages.isString('رمز عبور'))
    @IsNotEmpty(messages.notEmpty('رمز عبور'))
    password: string;


    @ApiProperty(phoneDoc)
    @IsString(messages.isString('شماره همراه'))
    @IsNotEmpty(messages.notEmpty('شماره همراه'))
    @Matches(...messages.phone())
    phone: string;

    @ApiPropertyOptional(nameDoc)
    @IsString(messages.isString('نام کاربر'))
    @IsOptional()
    name?: string;


    @ApiPropertyOptional(addressDoc)
    @IsArray(messages.isString('آدرس'))
    @IsString({ each: true, ...messages.isString('آدرس') })
    @IsOptional()
    address?: string[];
}