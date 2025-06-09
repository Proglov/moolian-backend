import { Injectable, } from '@nestjs/common';
import { UsersProvider } from './users.provider';
import { notFoundException } from 'src/common/errors';
import { FindOneDto } from 'src/common/findOne.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { User } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RestrictedUser } from './dto/types';

/**
 * Service class for handling user-related business operations.
 * This class acts as a facade between the controller and the provider,
 * implementing business logic and validation rules.
 * 
 * @class UsersService
 * @description Handles all business operations related to users,
 * delegating database operations to the UsersProvider.
 */
@Injectable()
export class UsersService {

    /** Inject the dependencies */
    constructor(
        /**  Inject the Users provider */
        private readonly usersProvider: UsersProvider
    ) { }

    /**
     * Finds a user by their ID
     * 
     * @param findOneDto - DTO containing the user ID
     * @returns Promise<Omit<User, 'password'>> - The found user without password but with refresh token
     * @throws NotFoundException if user not found
     */
    async findOne(findOneDto: FindOneDto): Promise<Omit<User, 'password'>> {
        const user = await this.usersProvider.findOneByID(findOneDto.id)
        if (!user) throw notFoundException('کاربر پیدا نشد')
        return user
    }

    /**
     * Retrieves a paginated list of users
     * 
     * @param limit - Number of items per page
     * @param page - Page number
     * @returns Promise<FindAllDto<RestrictedUser>> - Paginated list of users without sensitive data
     */
    async findAll(limit: number, page: number): Promise<FindAllDto<RestrictedUser>> {
        return await this.usersProvider.findAll(limit, page)
    }

    /**
     * Updates a user's information
     * 
     * @param userInfo - Current user's information
     * @param updateUserDto - Data to update
     * @returns Promise<RestrictedUser> - Updated user without sensitive data
     */
    async update(userInfo: CurrentUserData, updateUserDto: UpdateUserDto): Promise<RestrictedUser> {
        return await this.usersProvider.update(userInfo.userId, updateUserDto)
    }

    /**
     * Changes a user's password
     * 
     * @param userInfo - Current user's information
     * @param changePasswordDto - Current and new password
     * @returns Promise<void>
     */
    async changePassword(userInfo: CurrentUserData, changePasswordDto: ChangePasswordDto): Promise<void> {
        return await this.usersProvider.changePassword(userInfo.userId, changePasswordDto)
    }
}
