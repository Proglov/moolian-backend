import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserSignInWithPhoneDto } from './dto/user-signIn.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Response } from 'express';
import { CurrentUserData } from './interfacesAndType/current-user-data.interface';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LocalPhoneAuthGuard } from './guards/local-phone-auth.guard';
import { JWTRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-types';


/**
 * End points related to the Authentication
 */
@Controller('auth')
export class AuthController {

  /** Inject the dependencies */
  constructor(
    /** Inject the Auth Service */
    private readonly authService: AuthService
  ) { }


  /** User Registration */
  @Post('user/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'user signs up and gets the jwt' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Request time out for hashing the password or generating the jwt' })
  async signup(
    @Body() userSignupDto: UserSignupDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return await this.authService.userSignup(response, userSignupDto);
  }


  /** User Sign in with phone and password */
  @Post('user/sign-in/phone')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(LocalPhoneAuthGuard)
  @ApiOperation({ summary: 'user signs in with phone and password and gets the jwt in the cookie' })
  @ApiBody({
    description: 'User login with phone number and password',
    type: UserSignInWithPhoneDto,
  })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User Signed In' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid Credentials' })
  async signinWithPhone(
    @CurrentUser() userInfo: CurrentUserData,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return await this.authService.login(response, userInfo.userId)
  }


  /** User Sign In with Email or Username */
  @Post('user/sign-in/email-username')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'user signs in with Email-Username and password and gets the jwt' })
  @ApiBody({
    description: 'User login with phone number and password',
    type: UserSignInWithPhoneDto,
  })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User Signed In' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid Credentials' })
  async signinWithEmailOrUsername(
    @CurrentUser() userInfo: CurrentUserData,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return await this.authService.login(response, userInfo.userId)
  }


  /** User refreshes the tokens */
  @Post('user/refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JWTRefreshAuthGuard)
  @ApiOperation({ summary: 'User refreshes the tokens' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'tokens are refreshed' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid Credentials' })
  async refreshToken(
    @CurrentUser() userInfo: CurrentUserData,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return await this.authService.login(response, userInfo.userId)
  }


  /** User Log Out */
  @Get('user/logout')
  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'user logs out, looses the refresh token and access token' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User Logged Out' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User wasn\'t signed in, in the first place' })
  async logout(
    @CurrentUser() userInfo: CurrentUserData,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return await this.authService.logout(response, userInfo.userId)
  }

}