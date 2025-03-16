import { Inject, Injectable } from '@nestjs/common';
import { UserSignupDto } from 'src/auth/dto/user-signup.dto';
import { UsersProvider } from 'src/users/users.provider';
import { JWTProvider } from './providers/jwt.provider';
import { HashProvider } from './providers/password.provider';
import jwtConfig from '../configs/jwt.config';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';
import { JWT_Cookie_Name, REFRESH_Cookie_Name } from 'src/common/constants';
import { CookieProvider } from 'src/cookie/cookie.provider';
import { Types } from 'mongoose';


/** Class to preform business operations related to the authentication */
@Injectable()
export class AuthService {

  /** Inject the dependencies */
  constructor(
    /** Inject the UsersProvider from Users Module for creating and finding the user  */
    private readonly usersProvider: UsersProvider,

    /** Inject the JWTProvider to return the Token  */
    private readonly jwtProvider: JWTProvider,

    /** Inject jwtConfiguration to access TTLs */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    /** Inject the HashProvider to compare password */
    private readonly hashProvider: HashProvider,

    /** Inject the CookieProvider to add cookie */
    private readonly cookieProvider: CookieProvider
  ) { }


  /**
   * Users sign in with phone number and password and gets the cookies
   */
  async login(response: Response, userId: Types.ObjectId): Promise<void> {

    //*get access token and refresh token
    const tokens = await this.jwtProvider.generateJwtTokens(userId);

    //*add the access token to the cookie
    this.cookieProvider.addCookie(response, JWT_Cookie_Name, tokens.accessToken, this.jwtConfiguration.accessTokenTtl)

    //*add the refresh token to the cookie
    this.cookieProvider.addCookie(response, REFRESH_Cookie_Name, tokens.refreshToken, this.jwtConfiguration.refreshTokenTtl)

    const hashedToken = await this.hashProvider.hashString(tokens.refreshToken)

    //*add the refresh token to the DB
    await this.usersProvider.updateUser(
      { _id: userId },
      { $set: { refreshToken: hashedToken } }
    )
  }


  /**
   * Users log out and loose the cookie
   */
  async logout(response: Response, userId: Types.ObjectId): Promise<void> {

    //*remove the access token to the cookie
    this.cookieProvider.removeCookie(response, JWT_Cookie_Name)

    //*remove the refresh token to the cookie
    this.cookieProvider.removeCookie(response, REFRESH_Cookie_Name)

    //*delete the refresh token from the DB
    await this.usersProvider.updateUser(
      { _id: userId },
      { $set: { refreshToken: '' } }
    )
  }

  /**
   * Users register
   */
  async userSignup(response: Response, userSignupDto: UserSignupDto): Promise<void> {
    const createdUser = await this.usersProvider.create(userSignupDto);
    await this.login(response, createdUser._id)
  }

}
