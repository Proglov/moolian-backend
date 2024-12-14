import { BadRequestException, Injectable, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { FindOneUserParamDto } from './dto/findOneUser.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersProvider {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            const createdUser = new this.userModel(createUserDto);

            // you should check the existingSellerByPhone and username. email is fine i guess

            return await createdUser.save();
        } catch (error) {
            throw new BadRequestException('email exists')
        }
    }

    async findAll(): Promise<User[]> {
        return await this.userModel.find().exec();
    }

    async findOne(FindOneUserParamDto: FindOneUserParamDto): Promise<User> {
        return await this.userModel.findById(FindOneUserParamDto.id).exec();
    }
}
