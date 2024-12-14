import { Injectable } from '@nestjs/common';
import { SignupUserDto } from 'src/auth/dto/signup-user.dto';
import { UsersProvider } from 'src/users/users.provider';
import { JWTProvider } from './providers/jwt.provider';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersProvider: UsersProvider,
    private readonly jwtProvider: JWTProvider
  ) { }

  async userSignup(signupUserDto: SignupUserDto): Promise<string> {
    const createdUser = await this.usersProvider.create(signupUserDto);
    return await this.jwtProvider.generateJwtToken(createdUser._id as string)
  }

}
