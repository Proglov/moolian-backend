import { Test, TestingModule } from "@nestjs/testing";
import { UsersProvider } from "./users.provider";
import { HashProvider } from "src/auth/providers/password.provider";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { Model, Types } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import { badRequestException, requestTimeoutException } from "src/common/errors";


describe('UsersProvider', () => {
    let provider: UsersProvider;
    let mockUserModel: jest.Mocked<Model<User>>;
    let mockHashProvider: Partial<jest.Mocked<HashProvider>> = {
        hashString: jest.fn().mockResolvedValue('hashed_password')
    };
    const defaultUser = {
        _id: new Types.ObjectId(),
        username: 'defaultUser',
        phone: '0000000000',
        isEmailVerified: false,
        isPhoneVerified: false,
        password: 'hashed_password',
        refreshToken: 'some_refresh_token',
        email: 'default@example.com',
    };

    beforeEach(async () => {
        const mockModel: Partial<Record<keyof Model<User>, jest.Mock>> = {
            findById: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersProvider,
                { provide: getModelToken(User.name), useValue: mockModel },
                { provide: HashProvider, useValue: mockHashProvider },
            ],
        }).compile();

        provider = module.get<UsersProvider>(UsersProvider);
        mockUserModel = module.get(getModelToken(User.name));
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
        expect(mockUserModel).toBeDefined();
        expect(mockHashProvider).toBeDefined();
    });

    describe('create', () => {
        const createUserDto: CreateUserDto = {
            username: 'newUser',
            phone: '1234567890',
            password: 'plain_password',
            email: 'newuser@example.com',
        };

        it('should create a user and return user without password', async () => {
            // Mock new this.userModel() instance with save method
            const saveMock = jest.fn().mockResolvedValue({
                ...createUserDto,
                password: 'hashed_password',
                _id: new Types.ObjectId(),
                toObject: function () {
                    const obj = { ...this };
                    delete obj.password;
                    return obj;
                },
            });

            // Mock the constructor to return an object with save method
            (mockUserModel as any).mockImplementation = jest.fn(() => ({
                save: saveMock,
            }));

            // Since you use new this.userModel(), we need to mock constructor
            // But jest doesn't mock constructors by default, so we override provider.userModel to a function
            (provider as any).userModel = jest.fn().mockImplementation(() => ({
                save: saveMock,
            }));

            // Call create
            const result = await provider.create(createUserDto);

            expect(mockHashProvider.hashString).toHaveBeenCalledWith(createUserDto.password);
            expect(saveMock).toHaveBeenCalled();
            expect(result).not.toHaveProperty('password');
            expect(result).toMatchObject({
                username: createUserDto.username,
                phone: createUserDto.phone,
                email: createUserDto.email,
            });
        });

        it('should throw badRequestException on duplicate key error', async () => {
            const duplicateError = {
                code: 11000,
                keyPattern: { email: 1 },
            };

            const saveMock = jest.fn().mockRejectedValue(duplicateError);
            (provider as any).userModel = jest.fn().mockImplementation(() => ({
                save: saveMock,
            }));

            await expect(provider.create(createUserDto)).rejects.toThrow(
                badRequestException('این ایمیل قبلا ثبت نام شده است'),
            );
        });

        it('should throw requestTimeoutException on other errors', async () => {
            const otherError = new Error('DB down');
            const saveMock = jest.fn().mockRejectedValue(otherError);
            (provider as any).userModel = jest.fn().mockImplementation(() => ({
                save: saveMock,
            }));

            await expect(provider.create(createUserDto)).rejects.toThrow(
                requestTimeoutException('مشکلی در ثبت کاربر رخ داده است'),
            );
        });
    });

    describe('findOneByID', () => {
        it('should return user without password', async () => {
            // Mock findById().select() chain
            const selectMock = jest.fn().mockResolvedValue({
                ...defaultUser,
                password: undefined,
            });
            mockUserModel.findById.mockReturnValueOnce({ select: selectMock } as any);

            const result = await provider.findOneByID(defaultUser._id);

            expect(mockUserModel.findById).toHaveBeenCalledWith(defaultUser._id);
            expect(selectMock).toHaveBeenCalledWith('-password');
            expect(result).toMatchObject({
                _id: defaultUser._id,
                username: defaultUser.username,
                password: undefined,
            });
        });

        it('should throw badRequestException on CastError', async () => {
            const error = new Error('Cast to ObjectId failed');
            (error as any).name = 'CastError';
            const selectMock = jest.fn().mockRejectedValue(error);
            mockUserModel.findById.mockReturnValueOnce({ select: selectMock } as any);

            await expect(provider.findOneByID(new Types.ObjectId())).rejects.toThrow(
                badRequestException('آیدی کاربر صحیح نمیباشد'),
            );
        });

        it('should throw requestTimeoutException on other errors', async () => {
            const error = new Error('Some DB error');
            (error as any).name = 'SomeOtherError';
            const selectMock = jest.fn().mockRejectedValue(error);
            mockUserModel.findById.mockReturnValueOnce({ select: selectMock } as any);

            await expect(provider.findOneByID(new Types.ObjectId())).rejects.toThrow(
                requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است'),
            );
        });
    });
});
