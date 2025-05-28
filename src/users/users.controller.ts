import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RestrictedUser } from './dto/types';
import { FindOneDto } from 'src/common/findOne.dto';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { User } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';


/** End points related to the users */
@ApiTags('Users')
@Controller('users')
export class UsersController {

    /** Inject the dependencies */
    constructor(
        /** Inject the Users Service */
        private readonly userService: UsersService
    ) { }

    @Auth(AuthType.Admin)
    @Get()
    @ApiOperation({ summary: 'returns all users based on the pagination' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Users found', type: FindAllDto<User> })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Users are not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async findAll(
        @Query() query: PaginationDto
    ) {
        return await this.userService.findAll(query.limit, query.page);
    }

    @Auth(AuthType.Bearer)
    @Patch()
    @ApiOperation({ summary: 'updates a user' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'User updated' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User credentials has conflict' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'User is not updated' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    update(
        @CurrentUser() userInfo: CurrentUserData,
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.userService.update(userInfo, updateUserDto);
    }

    @Auth(AuthType.Bearer)
    @Patch('/password')
    @ApiOperation({ summary: 'changes the password of the user' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'User updated' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User credentials has conflict' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'User is not updated' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    changePAssword(
        @CurrentUser() userInfo: CurrentUserData,
        @Body() changePasswordDto: ChangePasswordDto
    ) {
        return this.userService.changePassword(userInfo, changePasswordDto);
    }

    @Auth(AuthType.Admin)
    @Get('admin')
    @ApiOperation({ summary: 'returns true if the user is admin' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'you are admin' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't admin" })
    async isAdmin() {
        return true
    }

    /**
     * find a single User using their extracted Id, doesn't return the password
     * Authenticated Users Only
     */
    @Auth(AuthType.Bearer)
    @Get('get-me')
    @ApiOperation({ summary: 'user gets its own data' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User found', type: RestrictedUser })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User Not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async getMe(
        @CurrentUser() userInfo: CurrentUserData
    ): Promise<RestrictedUser> {
        return this.userService.findOne({ id: userInfo.userId });
    }

    /**
     * find a single User by Id, doesn't return the password
     * Admin Only
     */
    @Auth(AuthType.Admin)
    @Get(':id')
    @ApiOperation({ summary: 'returns a specific user based on its id' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User found', type: RestrictedUser })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User Not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User Id is not correct' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async findOne(
        @Param() findOneDtoFindOneDto: FindOneDto
    ): Promise<RestrictedUser> {
        return this.userService.findOne(findOneDtoFindOneDto);
    }
}