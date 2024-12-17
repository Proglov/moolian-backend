import { Injectable, } from '@nestjs/common';
import { User } from './user.schema';
import { FindOneUserParamDto } from './dto/findOneUser.dto';
import { UsersProvider } from './users.provider';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersProvider: UsersProvider
    ) { }


    async findOne(FindOneUserParamDto: FindOneUserParamDto): Promise<Omit<User, 'password'>> {
        return await this.usersProvider.findOneByID(FindOneUserParamDto.id)
    }
}
