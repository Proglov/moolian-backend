import { Injectable, } from '@nestjs/common';
import { UsersProvider } from './users.provider';
import { notFoundException } from 'src/common/errors';
import { RestrictedUser } from './dto/types';
import { FindOneDto } from 'src/common/findOne.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { User } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { ChangePasswordDto } from './dto/change-password.dto';


/** Class to preform business operations related to the users, used by the controller mostly */
@Injectable()
export class UsersService {

    /** Inject the dependencies */
    constructor(
        /**  Inject the Users provider */
        private readonly usersProvider: UsersProvider
    ) { }

    /**
    * find a single User by Id, doesn't return the password
    */
    async findOne(findOneDto: FindOneDto) {
        const user = await this.usersProvider.findOneByID(findOneDto.id)
        if (!user) throw notFoundException('کاربر پیدا نشد')
        return user
    }

    /**
    * find a single User by Id, doesn't return the password
    */
    async findAll(limit: number, page: number): Promise<FindAllDto<User>> {
        return await this.usersProvider.findAll(limit, page)
    }

    async update(userInfo: CurrentUserData, updateUserDto: UpdateUserDto) {
        return await this.usersProvider.update(userInfo.userId, updateUserDto)
    }

    async changePassword(userInfo: CurrentUserData, changePasswordDto: ChangePasswordDto) {
        return await this.usersProvider.changePassword(userInfo.userId, changePasswordDto)
    }
}
