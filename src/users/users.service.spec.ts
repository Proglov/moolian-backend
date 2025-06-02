import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { UsersProvider } from "./users.provider";
import { Types } from "mongoose";
import { notFoundException } from "src/common/errors";


describe('UsersService', () => {
    let service: UsersService;
    let mockUsersProvider: Partial<UsersProvider>;
    const defaultUser = {
        _id: new Types.ObjectId(),
        username: 'defaultUser',
        phone: '0000000000',
        isEmailVerified: false,
        isPhoneVerified: false,
    };

    beforeEach(async () => {
        mockUsersProvider = {
            findOneByID: jest.fn().mockResolvedValue(defaultUser),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: UsersProvider, useValue: mockUsersProvider },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOne', () => {
        it('should return a user when found', async () => {
            const id = new Types.ObjectId();

            // Act
            const result = await service.findOne({ id });

            // Assert
            expect(result.username).toEqual(defaultUser.username);
            expect(mockUsersProvider.findOneByID).toHaveBeenCalledWith(id);
        });

        it("should throw not found exception when user doesn't exist", async () => {
            const id = new Types.ObjectId();

            // Override the mock for this call only
            (mockUsersProvider.findOneByID as jest.Mock).mockResolvedValueOnce(null);

            // Act & Assert
            await expect(service.findOne({ id })).rejects.toThrow(
                notFoundException('کاربر پیدا نشد'),
            );

            expect(mockUsersProvider.findOneByID).toHaveBeenCalledWith(id);
        });
    });
});