import { Injectable, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { FindOneUserParamDto } from './dto/findOneUser.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>
    ) { }


    async findOne(FindOneUserParamDto: FindOneUserParamDto): Promise<Omit<User, 'password'>> {
        return await this.userModel.findById(FindOneUserParamDto.id).select('-password').exec();
    }
}
