import { Injectable, } from '@nestjs/common';
import { User } from './user.schema';
import { FindOneUserParamDto } from './dto/findOneUser.dto';
import { UsersProvider } from './users.provider';
import { notFoundException } from 'src/common/errors';
import { RestrictedUser } from './dto/types';


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
    async findOne(findOneUserParamDto: FindOneUserParamDto): Promise<RestrictedUser> {
        const user = await this.usersProvider.findOneByID(findOneUserParamDto.id)
        if (!user) throw notFoundException('کاربر پیدا نشد')
        return user
    }
}
