import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '@nestjs/swagger';
import { HttpStatusCode } from 'axios';
import { SignupUserDto } from './dto/signup-user.dto';
import { User } from 'src/users/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('user')
  @ApiResponse({ status: HttpStatusCode.Created, description: 'User created' })
  @ApiResponse({ status: HttpStatusCode.BadRequest, description: 'Bad Request' })
  async signup(
    @Body() signupUserDto: SignupUserDto
  ): Promise<User> {
    return this.authService.userSignup(signupUserDto);
  }

}