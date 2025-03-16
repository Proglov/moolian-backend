import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { HashProvider } from 'src/auth/providers/password.provider';
import { RestrictedUser, TCreateUser, TFindUserByIdentifier } from './dto/types';
import { badRequestException, requestTimeoutException } from 'src/common/errors';


/** Class to preform business operations related to the users, used by other modules mostly */
@Injectable()
export class UsersProvider {

    readonly selectOptions = '-password'

    /** Inject the dependencies */
    constructor(
        /**  Inject the User Model */
        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        /** Inject the HashProvider from auth module */
        @Inject(forwardRef(() => HashProvider))
        private readonly hashProvider: HashProvider
    ) { }

    /**
     * Create a single User
     */
    async create(createUserDto: CreateUserDto): Promise<TCreateUser> {
        try {
            const hashedPassword = await this.hashProvider.hashString(createUserDto.password)
            const createdUser = new this.userModel({ ...createUserDto, password: hashedPassword });


            const newUser = (await createdUser.save()).toObject();
            delete newUser.password
            return newUser
        } catch (error) {
            //* mongoose duplication error
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

    /**
     * find a single User by Identifiers, returns only the password
     */
    async findOneByIdentifierAndGetPassword(input: TFindUserByIdentifier): Promise<Pick<User, 'password' | "_id">> {
        try {
            const existingUser = await this.userModel.findOne(input).select('password');
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

    /**
     * find a single User by Id, doesn't return the password
     */
    async findOneByID(id: Types.ObjectId): Promise<RestrictedUser> {
        try {
            const existingUser = await this.userModel.findById(id).select(this.selectOptions);
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

    /**
     * Updates a single user
     */
    async updateUser(query: FilterQuery<User>, data: UpdateQuery<User>) {
        try {
            return await this.userModel.findOneAndUpdate(query, data).select(this.selectOptions)
        } catch (error) {
            throw requestTimeoutException('مشکلی در آپدیت کردن کاربر رخ داده است')
        }
    }

}