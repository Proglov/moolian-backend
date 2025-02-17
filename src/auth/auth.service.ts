import { Injectable } from '@nestjs/common';
import { UserSignupDto } from 'src/auth/dto/user-signup.dto';
import { UsersProvider } from 'src/users/users.provider';
import { JWTProvider } from './providers/jwt.provider';
import { UserSignInWithPhoneDto, UserSignInWithUsernameOrEmailDto } from './dto/user-signIn.dto';
import { PasswordProvider } from './providers/password.provider';
import { unauthorizedException } from 'src/common/errors';
import { TAuthResponse } from './interfacesAndType/auth.response-type';


/** Class to preform business operations related to the authentication */
@Injectable()
export class AuthService {

  /** Inject the dependencies */
  constructor(
    /** Inject the UsersProvider from Users Module for creating and finding the user  */
    private readonly usersProvider: UsersProvider,

    /** Inject the JWTProvider to return the Token  */
    private readonly jwtProvider: JWTProvider,

    /** Inject the PasswordProvider to compare password */
    private readonly passwordProvider: PasswordProvider
  ) { }

  /**
   * Users register
   * @returns JWTToken
   */
  async userSignup(userSignupDto: UserSignupDto): Promise<TAuthResponse> {
    const createdUser = await this.usersProvider.create(userSignupDto);
    const token = await this.jwtProvider.generateJwtToken(createdUser._id as string)
    return {
      accessToken: token
    }
  }

  /**
   * Users sign in with phone number
   * @returns JWTToken
   */
  async userSigninWithPhone(userSignInWithPhoneDto: UserSignInWithPhoneDto): Promise<TAuthResponse> {
    let user = undefined
    const message = 'رمز عبور یا شماره همراه نادرست است'

    user = await this.usersProvider.findOneByIdentifierAndGetPassword({ phone: userSignInWithPhoneDto.phone });

    if (!user) throw unauthorizedException(message)

    const isPasswordTrue = await this.passwordProvider.comparePassword(userSignInWithPhoneDto.password, user.password)

    if (!isPasswordTrue) throw unauthorizedException(message)

    const token = await this.jwtProvider.generateJwtToken(user._id)
    return {
      accessToken: token
    }
  }

  /**
   * Users sign in with email or username
   * @returns JWTToken
   */
  async userSigninWithEmailOrUsername(userSignInWithUsernameOrEmailDto: UserSignInWithUsernameOrEmailDto): Promise<TAuthResponse> {
    let user = undefined
    const message = 'رمز عبور یا ایمیل یا نام کاربری نادرست است'


    //find the user by email
    user = await this.usersProvider.findOneByIdentifierAndGetPassword({ email: userSignInWithUsernameOrEmailDto.emailOrUsername });

    //find the user by username
    if (!user) {
      await this.usersProvider.findOneByIdentifierAndGetPassword({ username: userSignInWithUsernameOrEmailDto.emailOrUsername });
      if (!user) throw unauthorizedException(message)
    }

    const isPasswordTrue = await this.passwordProvider.comparePassword(userSignInWithUsernameOrEmailDto.password, user.password)

    if (!isPasswordTrue) throw unauthorizedException(message)

    const token = await this.jwtProvider.generateJwtToken(user._id)
    return {
      accessToken: token
    }
  }

}
