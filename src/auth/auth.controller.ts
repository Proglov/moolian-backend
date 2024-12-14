import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignupUserDto } from './dto/signup-user.dto';
import { User } from 'src/users/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('user')
  @ApiOperation({ summary: 'user signs in and gets the jwt' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async signup(
    @Body() signupUserDto: SignupUserDto
  ): Promise<User> {
    return this.authService.userSignup(signupUserDto);
  }

}