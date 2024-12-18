import { Injectable, } from '@nestjs/common';
import { User } from './user.schema';
import { FindOneUserParamDto } from './dto/findOneUser.dto';
import { UsersProvider } from './users.provider';
import { notFoundException } from 'src/common/errors';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersProvider: UsersProvider
    ) { }


    async findOne(FindOneUserParamDto: FindOneUserParamDto): Promise<Omit<User, 'password'>> {
        const user = await this.usersProvider.findOneByID(FindOneUserParamDto.id)
        if (!user) throw notFoundException('کاربر پیدا نشد')
        return user
    }
}
