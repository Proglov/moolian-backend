import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersProvider } from './users.provider';
import { Types } from 'mongoose';
import { notFoundException } from 'src/common/errors';
import { FindOneDto } from 'src/common/findOne.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let provider: UsersProvider;

    const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        username: 'testuser',
        phone: '09123456789',
        name: 'Test User',
        address: ['Tehran']
    };

    const mockUsersProvider = {
        findOneByID: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        changePassword: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UsersProvider,
                    useValue: mockUsersProvider,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        provider = module.get<UsersProvider>(UsersProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findOne', () => {
        it('should return a user when found', async () => {
            const findOneDto: FindOneDto = { id: mockUser._id };
            mockUsersProvider.findOneByID.mockResolvedValue(mockUser);

            const result = await service.findOne(findOneDto);

            expect(result).toEqual(mockUser);
            expect(provider.findOneByID).toHaveBeenCalledWith(mockUser._id);
        });

        it('should throw NotFoundException when user not found', async () => {
            const findOneDto: FindOneDto = { id: mockUser._id };
            mockUsersProvider.findOneByID.mockResolvedValue(null);

            await expect(service.findOne(findOneDto)).rejects.toThrow(NotFoundException);
            expect(provider.findOneByID).toHaveBeenCalledWith(mockUser._id);
        });
    });

    describe('findAll', () => {
        it('should return paginated users', async () => {
            const mockResponse = {
                items: [mockUser],
                count: 1,
            };
            mockUsersProvider.findAll.mockResolvedValue(mockResponse);

            const result = await service.findAll(10, 1);

            expect(result).toEqual(mockResponse);
            expect(provider.findAll).toHaveBeenCalledWith(10, 1);
        });
    });

    describe('update', () => {
        it('should update user successfully', async () => {
            const updateDto: UpdateUserDto = {
                name: 'Updated Name',
                address: ['New Address'],
            };
            const userInfo = { userId: mockUser._id };
            const updatedUser = { ...mockUser, ...updateDto };
            mockUsersProvider.update.mockResolvedValue(updatedUser);

            const result = await service.update(userInfo, updateDto);

            expect(result).toEqual(updatedUser);
            expect(provider.update).toHaveBeenCalledWith(mockUser._id, updateDto);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const changePasswordDto: ChangePasswordDto = {
                currentPassword: 'oldPassword',
                password: 'newPassword',
            };
            const userInfo = { userId: mockUser._id };
            mockUsersProvider.changePassword.mockResolvedValue(undefined);

            await service.changePassword(userInfo, changePasswordDto);

            expect(provider.changePassword).toHaveBeenCalledWith(mockUser._id, changePasswordDto);
        });
    });
});