import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserSignInWithPhoneDto, UserSignInWithUsernameOrEmailDto } from './dto/user-signIn.dto';
import { AuthResponse, TAuthResponse } from './interfacesAndType/auth.response-type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('user/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'user signs up and gets the jwt' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created', type: AuthResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Request time out for hashing the password or generating the jwt' })
  async signup(
    @Body() userSignupDto: UserSignupDto
  ): Promise<TAuthResponse> {
    return this.authService.userSignup(userSignupDto);
  }

  @Post('user/sign-in/phone')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'user signs in with phone and password and gets the jwt' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User Signed In', type: AuthResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid Credentials' })
  async signinWithPhone(
    @Body() userSignInWithPhoneDto: UserSignInWithPhoneDto
  ): Promise<TAuthResponse> {
    return this.authService.userSigninWithPhone(userSignInWithPhoneDto);
  }

  @Post('user/sign-in/email-username')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'user signs in with Email-Username and password and gets the jwt' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User Signed In', type: AuthResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid Credentials' })
  async signinWithEmailOrUsername(
    @Body() userSignInWithUsernameOrEmailDto: UserSignInWithUsernameOrEmailDto
  ): Promise<TAuthResponse> {
    return this.authService.userSigninWithEmailOrUsername(userSignInWithUsernameOrEmailDto);
  }

}