import { BadRequestException, forwardRef, Inject, Injectable, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordProvider } from 'src/auth/providers/password.provider';

@Injectable()
export class UsersProvider {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        @Inject(forwardRef(() => PasswordProvider))
        private readonly passwordProvider: PasswordProvider
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            const hashedPassword = await this.passwordProvider.hashPassword(createUserDto.password)
            const createdUser = new this.userModel({ ...createUserDto, password: hashedPassword });

            // you should check the existingSellerByPhone and username. email is fine i guess

            return await createdUser.save();
        } catch (error) {
            // mongoose duplication error
            if (error?.code === 11000) {
                const DB_Error = Object.keys(error?.keyPattern)[0]
                switch (DB_Error) {
                    case 'email':
                        throw new BadRequestException(['این ایمیل قبلا ثبت نام شده است'])
                    case 'phone':
                        throw new BadRequestException(['این شماره قبلا ثبت نام شده است'])
                    case 'username':
                        throw new BadRequestException(['این نام کاربری قبلا ثبت نام شده است'])
                }
            }
            throw new BadRequestException(['مشکلی در ثبت کاربر رخ داده است'])
        }
    }

}