import { Test, TestingModule } from '@nestjs/testing';
import { UsersProvider } from './users.provider';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { HashProvider } from 'src/auth/providers/password.provider';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { BadRequestException, NotFoundException, RequestTimeoutException, UnauthorizedException } from '@nestjs/common';

describe('UsersProvider', () => {
    let provider: UsersProvider;
    let model: Model<User>;
    let hashProvider: HashProvider;

    const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        username: 'testuser',
        phone: '09123456789',
        name: 'Test User',
        address: ['Tehran'],
        password: 'hashedPassword',
        isEmailVerified: false,
        isPhoneVerified: false,
    };

    const mockModel = {
        create: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        find: jest.fn(),
        findOneAndUpdate: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        countDocuments: jest.fn(),
    };

    const mockHashProvider = {
        hashString: jest.fn(),
        compareHashed: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersProvider,
                {
                    provide: getModelToken(User.name),
                    useValue: mockModel,
                },
                {
                    provide: HashProvider,
                    useValue: mockHashProvider,
                },
            ],
        }).compile();

        provider = module.get<UsersProvider>(UsersProvider);
        model = module.get<Model<User>>(getModelToken(User.name));
        hashProvider = module.get<HashProvider>(HashProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            const createUserDto: CreateUserDto = {
                email: 'new@example.com',
                password: 'password123',
                username: 'newuser',
                phone: '09123456789',
            };

            const hashedPassword = 'hashedPassword123';
            mockHashProvider.hashString.mockResolvedValue(hashedPassword);
            mockModel.create.mockResolvedValue({
                ...createUserDto,
                password: hashedPassword,
                toObject: () => ({ ...createUserDto, password: hashedPassword }),
            });

            const result = await provider.create(createUserDto);

            expect(result).not.toHaveProperty('password');
            expect(mockHashProvider.hashString).toHaveBeenCalledWith(createUserDto.password);
            expect(mockModel.create).toHaveBeenCalledWith({
                ...createUserDto,
                password: hashedPassword,
            });
        });

        it('should throw BadRequestException for duplicate email', async () => {
            const createUserDto: CreateUserDto = {
                email: 'existing@example.com',
                password: 'password123',
                username: 'newuser',
                phone: '09123456789',
            };

            mockModel.create.mockRejectedValue({
                code: 11000,
                keyPattern: { email: 1 },
            });

            await expect(provider.create(createUserDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findOneByIdentifierAndGetPassword', () => {
        it('should find user by identifier and return password', async () => {
            const identifier = { email: 'test@example.com' };
            mockModel.findOne.mockResolvedValue({ _id: mockUser._id, password: mockUser.password });

            const result = await provider.findOneByIdentifierAndGetPassword(identifier);

            expect(result).toEqual({ _id: mockUser._id, password: mockUser.password });
            expect(mockModel.findOne).toHaveBeenCalledWith(identifier);
        });
    });

    describe('findOneByID', () => {
        it('should find user by ID', async () => {
            mockModel.findById.mockResolvedValue(mockUser);

            const result = await provider.findOneByID(mockUser._id);

            expect(result).toEqual(mockUser);
            expect(mockModel.findById).toHaveBeenCalledWith(mockUser._id);
        });

        it('should throw BadRequestException for invalid ID', async () => {
            mockModel.findById.mockRejectedValue({ name: 'CastError' });

            await expect(provider.findOneByID(mockUser._id)).rejects.toThrow(BadRequestException);
        });

        it('should return null when user is not found', async () => {
            mockModel.findById.mockResolvedValue(null);

            const result = await provider.findOneByID(mockUser._id);

            expect(result).toBeNull();
            expect(mockModel.findById).toHaveBeenCalledWith(mockUser._id);
        });
    });

    describe('findAll', () => {
        it('should return paginated users', async () => {
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([mockUser]),
            };

            mockModel.find.mockReturnValue(mockQuery);
            mockModel.countDocuments.mockResolvedValue(1);

            const result = await provider.findAll(10, 1);

            expect(result).toEqual({
                items: [mockUser],
                count: 1,
            });
        });

        it('should throw RequestTimeoutException on database error', async () => {
            mockModel.find.mockRejectedValue(new Error('Database error'));

            await expect(provider.findAll(10, 1)).rejects.toThrow(RequestTimeoutException);
        });
    });

    describe('updateUserSystematically', () => {
        it('should update user successfully', async () => {
            const query = { _id: mockUser._id };
            const updateData = { name: 'Updated Name' };
            const updatedUser = { ...mockUser, ...updateData };

            mockModel.findOneAndUpdate.mockResolvedValue(updatedUser);

            const result = await provider.updateUserSystematically(query, updateData);

            expect(result).toEqual(updatedUser);
            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(query, updateData);
        });

        it('should throw RequestTimeoutException on database error', async () => {
            const query = { _id: mockUser._id };
            const updateData = { name: 'Updated Name' };

            mockModel.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

            await expect(provider.updateUserSystematically(query, updateData)).rejects.toThrow(RequestTimeoutException);
        });
    });

    describe('update', () => {
        it('should update user successfully', async () => {
            const updateDto: UpdateUserDto = {
                name: 'Updated Name',
                address: ['New Address'],
            };

            const updatedUser = { ...mockUser, ...updateDto };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

            const result = await provider.update(mockUser._id, updateDto);

            expect(result).toEqual(updatedUser);
            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUser._id,
                expect.any(Object),
                { returnDocument: 'after' }
            );
        });

        it('should throw BadRequestException for duplicate email', async () => {
            const updateDto: UpdateUserDto = {
                email: 'existing@example.com',
            };

            mockModel.findByIdAndUpdate.mockRejectedValue({
                code: 11000,
                keyPattern: { email: 1 },
            });

            await expect(provider.update(mockUser._id, updateDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when address limit is exceeded', async () => {
            const updateDto: UpdateUserDto = {
                address: ['Address 1', 'Address 2', 'Address 3', 'Address 4'],
            };

            await expect(provider.update(mockUser._id, updateDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when user is not found', async () => {
            const updateDto: UpdateUserDto = {
                name: 'Updated Name',
            };

            mockModel.findByIdAndUpdate.mockResolvedValue(null);

            await expect(provider.update(mockUser._id, updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const changePasswordDto: ChangePasswordDto = {
                currentPassword: 'oldPassword',
                password: 'newPassword',
            };

            const mockUserWithSave = {
                ...mockUser,
                save: jest.fn().mockResolvedValue(true)
            };
            mockModel.findById.mockResolvedValue(mockUserWithSave);
            mockHashProvider.compareHashed.mockResolvedValue(true);
            mockHashProvider.hashString.mockResolvedValue('newHashedPassword');

            await provider.changePassword(mockUser._id, changePasswordDto);

            expect(mockModel.findById).toHaveBeenCalledWith(mockUser._id);
            expect(mockHashProvider.compareHashed).toHaveBeenCalledWith(
                changePasswordDto.currentPassword,
                mockUser.password
            );
            expect(mockHashProvider.hashString).toHaveBeenCalledWith(changePasswordDto.password);
            expect(mockUserWithSave.save).toHaveBeenCalled();
        });

        it('should throw UnauthorizedException for incorrect current password', async () => {
            const changePasswordDto: ChangePasswordDto = {
                currentPassword: 'wrongPassword',
                password: 'newPassword',
            };

            mockModel.findById.mockResolvedValue(mockUser);
            mockHashProvider.compareHashed.mockResolvedValue(false);

            await expect(provider.changePassword(mockUser._id, changePasswordDto)).rejects.toThrow(
                UnauthorizedException
            );
        });

        it('should throw NotFoundException when user is not found', async () => {
            const changePasswordDto: ChangePasswordDto = {
                currentPassword: 'oldPassword',
                password: 'newPassword',
            };

            mockModel.findById.mockResolvedValue(null);

            await expect(provider.changePassword(mockUser._id, changePasswordDto)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw RequestTimeoutException on database error', async () => {
            const changePasswordDto: ChangePasswordDto = {
                currentPassword: 'oldPassword',
                password: 'newPassword',
            };

            mockModel.findById.mockRejectedValue(new Error('Database error'));

            await expect(provider.changePassword(mockUser._id, changePasswordDto)).rejects.toThrow(
                RequestTimeoutException
            );
        });
    });
});
