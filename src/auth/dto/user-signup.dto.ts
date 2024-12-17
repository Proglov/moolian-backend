import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class UserSignupDto extends OmitType(CreateUserDto, ['name', 'address'] as const) { }