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

    async findAll(): Promise<User[]> {
        return await this.userModel.find().exec();
    }

    async findOne(FindOneUserParamDto: FindOneUserParamDto): Promise<User> {
        return await this.userModel.findById(FindOneUserParamDto.id).exec();
    }
}
