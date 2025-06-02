import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service"
import { UsersProvider } from "./users.provider";
import { Types } from "mongoose";


describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        const mockUsersProvider: Partial<UsersProvider> = {
            create(createUserDto) {
                return Promise.resolve({
                    _id: new Types.ObjectId('12345'),
                    email: createUserDto.email,
                    phone: createUserDto.phone,
                    username: createUserDto.username,
                    address: createUserDto.address,
                    name: createUserDto.name,
                })
            },
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: UsersProvider, useValue: mockUsersProvider }
            ]
        }).compile();

        service = module.get<UsersService>(UsersService);
    })

    it('should be defined', () => {
        expect(service).toBeDefined();
    })


})