import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import messages from 'src/common/dto.messages';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class UserSignInWithPhoneDto extends PickType(CreateUserDto, ['phone', 'password'] as const) { }

const emailOrUsernameDoc = {
    description: 'Username or email of the user, should be a non-empty string',
    type: String,
    example: 'username123 or email@em.ail'
}

export class UserSignInWithUsernameOrEmailDto extends PickType(CreateUserDto, ['password'] as const) {
    @ApiProperty(emailOrUsernameDoc)
    @IsString(messages.isString('نام کاربری'))
    @IsNotEmpty(messages.notEmpty('نام کاربری'))
    emailOrUsername: string;
}