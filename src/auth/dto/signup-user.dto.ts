import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class SignupUserDto extends OmitType(CreateUserDto, ['name', 'address'] as const) { }