import { Injectable } from '@nestjs/common';
import { SignupUserDto } from 'src/auth/dto/signup-user.dto';
import { User } from 'src/users/user.schema';
import { UsersProvider } from 'src/users/users.provider';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersUsersProvider: UsersProvider
  ) { }

  async userSignup(signupUserDto: SignupUserDto): Promise<User> {
    const createdUser = this.usersUsersProvider.create(signupUserDto);
    return createdUser
  }

}
