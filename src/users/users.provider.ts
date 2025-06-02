import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { HashProvider } from 'src/auth/providers/password.provider';
import { RestrictedUser, TCreateUser, TFindUserByIdentifier } from './dto/types';
import { badRequestException, notFoundException, requestTimeoutException, unauthorizedException } from 'src/common/errors';
import { FindAllDto } from 'src/common/findAll.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';


/** Class to preform business operations related to the users, used by other modules mostly */
@Injectable()
export class UsersProvider {

    readonly selectOptions = '-password -refreshToken'

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
            return await this.userModel.findOne(input).select('password');
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

    /**
     * find a single User by Id, doesn't return the password but it should return refreshToken
     */
    async findOneByID(id: Types.ObjectId) {
        try {
            const existingUser = await this.userModel.findById(id).select('-password');
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }


    async findAll(limit: number, page: number): Promise<FindAllDto<User>> {
        try {
            const skip = (page - 1) * limit;

            const query = this.userModel.find()
                .select(this.selectOptions)
                .skip(skip).limit(limit)

            let [users, count] = await Promise.all([
                query.lean().exec() as unknown as User[],
                this.userModel.countDocuments()
            ]);


            return {
                count,
                items: users
            }

        } catch (error) {
            throw requestTimeoutException('مشکلی در گرفتن کاربران رخ داده است')
        }
    }

    /**
     * Updates a single user. should be used out of the users' interaction
     */
    async updateUserSystematically(query: FilterQuery<User>, data: UpdateQuery<User>) {
        try {
            return await this.userModel.findOneAndUpdate(query, data).select(this.selectOptions)
        } catch (error) {
            throw requestTimeoutException('مشکلی در آپدیت کردن کاربر رخ داده است')
        }
    }

    /**
     * Updates a single user. password can not be changed in this method
     */
    async update(id: Types.ObjectId, updateUserDto: UpdateUserDto) {
        try {
            const newObj: Partial<User> = { ...updateUserDto }

            if (!!updateUserDto.phone)
                newObj.isPhoneVerified = false;
            if (!!updateUserDto.email)
                newObj.isEmailVerified = false;
            if (Array.isArray(updateUserDto.address) && updateUserDto.address.length > 3)
                throw new Error('Address Error');

            return await this.userModel.findByIdAndUpdate(id, newObj, { returnDocument: 'after' }).select(this.selectOptions);

        } catch (error) {
            if (error instanceof NotFoundException)
                throw notFoundException('آیدی کاربر یافت نشد');

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
            if (error.message == 'Address Error')
                throw badRequestException('امکان درج بیش از سه آدرس وجود ندارد')
            throw requestTimeoutException('مشکلی در ویرایش کاربر رخ داده است')
        }
    }

    async changePassword(userId: Types.ObjectId, changePasswordDto: ChangePasswordDto) {
        const user = await this.userModel.findById(userId).select('password');
        const isPasswordTrue = await this.hashProvider.compareHashed(changePasswordDto.currentPassword, user.password);
        if (!isPasswordTrue) throw unauthorizedException('رمزعبور فعلی وارد شده صحیح نمیباشد');
        try {
            const hashedPassword = await this.hashProvider.hashString(changePasswordDto.password)
            user.password = hashedPassword;
            await user.save();
        } catch (error) {
            throw requestTimeoutException('مشکلی در ذخیره سازی رمزعبور رخ داده است')
        }

    }
}