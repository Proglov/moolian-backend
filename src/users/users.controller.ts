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
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

/**
 * Controller handling all user-related endpoints
 * @class UsersController
 */
@ApiTags('Users')
@Controller('users')
export class UsersController {

    /** Inject the dependencies */
    constructor(
        /** Inject the Users Service */
        private readonly userService: UsersService
    ) { }

    /**
     * Get all users with pagination
     * @param {PaginationDto} query - Pagination parameters
     * @returns {Promise<FindAllDto<RestrictedUser>>} Paginated list of users without sensitive data
     */
    @Auth(AuthType.Admin)
    @Get()
    @ApiOperation({ summary: 'Get all users with pagination' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({
        status: HttpStatus.ACCEPTED,
        description: 'Users found successfully',
        type: FindAllDto<RestrictedUser>
    })
    @ApiResponse({
        status: HttpStatus.REQUEST_TIMEOUT,
        description: 'Request timed out while fetching users'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User is not authorized to access this resource'
    })
    async findAll(
        @Query() query: PaginationDto
    ): Promise<FindAllDto<RestrictedUser>> {
        return await this.userService.findAll(query.limit, query.page);
    }

    /**
     * Update user information
     * @param {CurrentUserData} userInfo - Current user information
     * @param {UpdateUserDto} updateUserDto - Updated user data
     * @returns {Promise<RestrictedUser>} Updated user information without sensitive data
     */
    @Auth(AuthType.Bearer)
    @Patch()
    @ApiOperation({ summary: 'Update user information' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User updated successfully',
        type: RestrictedUser
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid user credentials or data conflict'
    })
    @ApiResponse({
        status: HttpStatus.REQUEST_TIMEOUT,
        description: 'Request timed out while updating user'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User is not authorized to perform this action'
    })
    async update(
        @CurrentUser() userInfo: CurrentUserData,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<RestrictedUser> {
        return this.userService.update(userInfo, updateUserDto);
    }

    /**
     * Change user password
     * @param {CurrentUserData} userInfo - Current user information
     * @param {ChangePasswordDto} changePasswordDto - New password information
     * @returns {Promise<void>}
     */
    @Auth(AuthType.Bearer)
    @Patch('/password')
    @ApiOperation({ summary: 'Change user password' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password changed successfully'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid password or credentials'
    })
    @ApiResponse({
        status: HttpStatus.REQUEST_TIMEOUT,
        description: 'Request timed out while changing password'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User is not authorized to perform this action'
    })
    async changePassword(
        @CurrentUser() userInfo: CurrentUserData,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        return this.userService.changePassword(userInfo, changePasswordDto);
    }

    /**
     * Check if user is admin
     * @returns {Promise<boolean>} True if user is admin
     */
    @Auth(AuthType.Admin)
    @Get('admin')
    @ApiOperation({ summary: 'Check if user is admin' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({
        status: HttpStatus.ACCEPTED,
        description: 'User is admin',
        type: Boolean
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User is not an admin'
    })
    async isAdmin(): Promise<boolean> {
        return true;
    }

    /**
     * Get current user's information
     * @param {CurrentUserData} userInfo - Current user information
     * @returns {Promise<RestrictedUser>} Current user's information without password and refresh token
     */
    @Auth(AuthType.Bearer)
    @Get('get-me')
    @ApiOperation({ summary: 'Get current user information' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({
        status: HttpStatus.ACCEPTED,
        description: 'User information retrieved successfully',
        type: RestrictedUser
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User is not authorized to access this resource'
    })
    async getMe(
        @CurrentUser() userInfo: CurrentUserData
    ): Promise<RestrictedUser> {
        return this.userService.findOne({ id: userInfo.userId });
    }

    /**
     * Get user by ID
     * @param {FindOneDto} findOneDto - User ID
     * @returns {Promise<RestrictedUser>} User information without password and refresh token
     */
    @Auth(AuthType.Admin)
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({
        status: HttpStatus.ACCEPTED,
        description: 'User found successfully',
        type: RestrictedUser
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid user ID format'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User is not authorized to access this resource'
    })
    async findOne(
        @Param() findOneDto: FindOneDto
    ): Promise<RestrictedUser> {
        return this.userService.findOne(findOneDto);
    }
}