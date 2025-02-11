import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.schema';
import { ApiTags, ApiResponse, ApiCreatedResponse, OmitType } from '@nestjs/swagger';
import { FindOneUserParamDto } from './dto/findOneUser.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Auth(AuthType.Admin)
    @Get(':id')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiCreatedResponse({ type: OmitType(CreateUserDto, ['password']) })
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User found' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User Not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User Id is not correct' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async findOne(
        @Param() findOneUserParamDto: FindOneUserParamDto
    ): Promise<Omit<User, 'password'>> {
        return this.userService.findOne(findOneUserParamDto);
    }

    @Auth(AuthType.Bearer)
    @Get('get-me')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiCreatedResponse({ type: OmitType(CreateUserDto, ['password']) })
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User found' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User Not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async getMe(
        @Param() findOneUserParamDto: FindOneUserParamDto
    ): Promise<Omit<User, 'password'>> {
        return this.userService.findOne(findOneUserParamDto);
    }
}