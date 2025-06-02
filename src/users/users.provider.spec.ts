import { Test, TestingModule } from "@nestjs/testing";
import { UsersProvider } from "./users.provider"
import { HashProvider } from "src/auth/providers/password.provider";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { Model } from "mongoose";

describe('UsersProvider', () => {
    let mockUserModel: Model<User>;
    let provider: UsersProvider;
    let mockHashProvider: jest.Mocked<HashProvider>;

    beforeEach(async () => {
        const mockModel = {
            findOne: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            // Add other mongoose methods you use
        };

        // Mock hash provider properly
        mockHashProvider = {
            hashString: jest.fn().mockResolvedValue('hashed_password'),
            compareHashed: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersProvider,
                { provide: getModelToken(User.name), useValue: mockModel },
                { provide: HashProvider, useValue: {} }
            ]
        }).compile();

        provider = module.get<UsersProvider>(UsersProvider);
        mockUserModel = module.get<Model<User>>(getModelToken(User.name));
    })

    it('should be defined', () => {
        expect(provider).toBeDefined();
        expect(mockUserModel).toBeDefined();
        expect(mockHashProvider).toBeDefined();
    });
})