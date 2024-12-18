import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordProvider } from 'src/auth/providers/password.provider';
import { TCreateUser, TFindUserByIdentifier } from './dto/types';
import { badRequestException, requestTimeoutException } from 'src/common/errors';



@Injectable()
export class UsersProvider {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        @Inject(forwardRef(() => PasswordProvider))
        private readonly passwordProvider: PasswordProvider
    ) { }

    async create(createUserDto: CreateUserDto): Promise<TCreateUser> {
        try {
            const hashedPassword = await this.passwordProvider.hashPassword(createUserDto.password)
            const createdUser = new this.userModel({ ...createUserDto, password: hashedPassword });

            // you should check the existingSellerByPhone and username. email is fine i guess

            const newUser = (await createdUser.save()).toObject();
            delete newUser.password
            return newUser
        } catch (error) {
            // mongoose duplication error
            if (error?.code === 11000) {
                const DB_Error = Object.keys(error?.keyPattern)[0]
                switch (DB_Error) {
                    case 'email':
                        throw badRequestException('این ایمیل قبلا ثبت نام شده است')
                    case 'phone':
                        throw badRequestException('این شماره قبلا ثبت نام شده است')
                    case 'username':
                        throw badRequestException('این نام کاربری قبلا ثبت نام شده است')
                }
            }
            throw requestTimeoutException('مشکلی در ثبت کاربر رخ داده است')
        }
    }

    async findOneByIdentifier(input: TFindUserByIdentifier): Promise<User> {
        try {
            const existingUser = await this.userModel.findOne(input).select('-password');
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

    async findOneByIdentifierAndGetPassword(input: TFindUserByIdentifier): Promise<Pick<User, 'password'>> {
        try {
            const existingUser = await this.userModel.findOne(input).select('password');
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

    async findOneByID(id: string): Promise<User> {
        try {
            const existingUser = await this.userModel.findById(id).select('-password');
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

}