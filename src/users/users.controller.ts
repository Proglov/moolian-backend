import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.schema';
import { ApiTags, ApiResponse, OmitType } from '@nestjs/swagger';
import { FindOneUserParamDto } from './dto/findOneUser.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';


/** End points related to the users */
@ApiTags('Users')
@Controller('users')
export class UsersController {

    /** Inject the dependencies */
    constructor(
        /** Inject the Users Service */
        private readonly userService: UsersService
    ) { }


    /**
     * find a single User using their extracted Id, doesn't return the password
     * Authenticated Users Only
     */
    @Auth(AuthType.Bearer)
    @Get('get-me')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User found', type: OmitType(CreateUserDto, ['password']) })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User Not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async getMe(
        @CurrentUser() userInfo: CurrentUserData
    ): Promise<Omit<User, 'password'>> {
        return this.userService.findOne({ id: userInfo.userId });
    }

    /**
     * find a single User by Id, doesn't return the password
     * Admin Only
     */
    @Auth(AuthType.Admin)
    @Get(':id')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User found', type: OmitType(CreateUserDto, ['password']) })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User Not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User Id is not correct' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async findOne(
        @Param() findOneUserParamDto: FindOneUserParamDto
    ): Promise<Omit<User, 'password'>> {
        return this.userService.findOne(findOneUserParamDto);
    }
}