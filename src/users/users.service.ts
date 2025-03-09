import { Injectable, } from '@nestjs/common';
import { UsersProvider } from './users.provider';
import { notFoundException } from 'src/common/errors';
import { RestrictedUser } from './dto/types';
import { FindOneDto } from 'src/common/findOne.dto';


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
    async findOne(findOneDto: FindOneDto): Promise<RestrictedUser> {
        const user = await this.usersProvider.findOneByID(findOneDto.id)
        if (!user) throw notFoundException('کاربر پیدا نشد')
        return user
    }
}
