import { forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { HashProvider } from 'src/auth/providers/password.provider';
import { TCreateUser, TFindUserByIdentifier, RestrictedUser } from './dto/types';
import { badRequestException, notFoundException, requestTimeoutException, unauthorizedException } from 'src/common/errors';
import { FindAllDto } from 'src/common/findAll.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

/**
 * Provider class for handling user-related database operations and business logic.
 * This class is responsible for all direct database interactions and data manipulation.
 * 
 * @class UsersProvider
 * @description Handles all database operations related to users including CRUD operations,
 * password management, and user verification status updates.
 */
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
     * Creates a new user in the database
     * 
     * @param createUserDto - The DTO containing user creation data
     * @returns Promise<TCreateUser> - The created user object without password
     * @throws BadRequestException if email/phone/username already exists
     * @throws RequestTimeoutException if database operation fails
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
     * Finds a user by their identifier (email/phone/username) and returns only password
     * 
     * @param input - Object containing identifier fields to search by
     * @returns Promise<Pick<User, 'password' | "_id">> - User's password and ID
     * @throws BadRequestException if ID format is invalid
     * @throws RequestTimeoutException if database operation fails
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
     * Finds a user by their ID, excluding password but including refresh token
     * 
     * @param id - The user's MongoDB ObjectId
     * @returns Promise<Omit<User, 'password'>> - The found user without password
     * @throws BadRequestException if ID format is invalid
     * @throws RequestTimeoutException if database operation fails
     */
    async findOneByID(id: Types.ObjectId): Promise<Omit<User, 'password'>> {
        try {
            const existingUser = await this.userModel.findById(id).select('-password');
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

    /**
     * Retrieves a paginated list of users
     * 
     * @param limit - Number of items per page
     * @param page - Page number
     * @returns Promise<FindAllDto<RestrictedUser>> - Paginated list of users without sensitive data
     * @throws RequestTimeoutException if database operation fails
     */
    async findAll(limit: number, page: number): Promise<FindAllDto<RestrictedUser>> {
        try {
            const skip = (page - 1) * limit;

            const query = this.userModel.find()
                .select(this.selectOptions)
                .skip(skip).limit(limit)

            let [users, count] = await Promise.all([
                query.lean().exec() as unknown as RestrictedUser[],
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
     * Updates a user's information systemically (used by other modules)
     * 
     * @param query - MongoDB query to find the user
     * @param data - Data to update
     * @returns Promise<RestrictedUser> - Updated user without sensitive data
     * @throws RequestTimeoutException if database operation fails
     */
    async updateUserSystematically(query: FilterQuery<User>, data: UpdateQuery<User>): Promise<RestrictedUser> {
        try {
            return await this.userModel.findOneAndUpdate(query, data).select(this.selectOptions)
        } catch (error) {
            throw requestTimeoutException('مشکلی در آپدیت کردن کاربر رخ داده است')
        }
    }

    /**
     * Updates a user's information (used by the users module)
     * 
     * @param id - User's MongoDB ObjectId
     * @param updateUserDto - Data to update
     * @returns Promise<RestrictedUser> - Updated user without sensitive data
     * @throws BadRequestException if email/phone/username already exists or address limit exceeded
     * @throws NotFoundException if user not found
     * @throws RequestTimeoutException if database operation fails
     */
    async update(id: Types.ObjectId, updateUserDto: UpdateUserDto): Promise<RestrictedUser> {
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

    /**
     * Changes a user's password
     * 
     * @param userId - User's MongoDB ObjectId
     * @param changePasswordDto - Current and new password
     * @throws UnauthorizedException if current password is incorrect
     * @throws RequestTimeoutException if database operation fails
     */
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