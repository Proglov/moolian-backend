import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserSignupDto } from 'src/auth/dto/user-signup.dto';
import { UsersProvider } from 'src/users/users.provider';
import { JWTProvider } from './providers/jwt.provider';
import { UserSignInWithPhoneDto, UserSignInWithUsernameOrEmailDto } from './dto/user-signIn.dto';
import { PasswordProvider } from './providers/password.provider';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersProvider: UsersProvider,
    private readonly jwtProvider: JWTProvider,
    private readonly passwordProvider: PasswordProvider
  ) { }

  async userSignup(userSignupDto: UserSignupDto): Promise<string> {
    const createdUser = await this.usersProvider.create(userSignupDto);
    return await this.jwtProvider.generateJwtToken(createdUser._id as string)
  }

  async userSigninWithPhone(userSignInWithPhoneDto: UserSignInWithPhoneDto): Promise<string> {
    let user = undefined
    const message = 'رمز عبور یا شماره همراه نادرست است'

    user = await this.usersProvider.findOneByIdentifier({ phone: userSignInWithPhoneDto.phone });

    if (!user) throw new UnauthorizedException([message])

    const isPasswordTrue = await this.passwordProvider.comparePassword(userSignInWithPhoneDto.password, user.password)

    if (!isPasswordTrue) throw new UnauthorizedException([message])

    return await this.jwtProvider.generateJwtToken(user._id)
  }

  async userSigninWithEmailOrUsername(userSignInWithUsernameOrEmailDto: UserSignInWithUsernameOrEmailDto): Promise<string> {
    let user = undefined
    const message = 'رمز عبور یا ایمیل یا نام کاربری نادرست است'


    //find the user by email
    user = await this.usersProvider.findOneByIdentifier({ email: userSignInWithUsernameOrEmailDto.emailOrUsername });

    //find the user by username
    if (!user) {
      await this.usersProvider.findOneByIdentifier({ username: userSignInWithUsernameOrEmailDto.emailOrUsername });
      if (!user) throw new UnauthorizedException([message])
    }

    const isPasswordTrue = await this.passwordProvider.comparePassword(userSignInWithUsernameOrEmailDto.password, user.password)

    if (!isPasswordTrue) throw new UnauthorizedException([message])

    return await this.jwtProvider.generateJwtToken(user._id)
  }

}
