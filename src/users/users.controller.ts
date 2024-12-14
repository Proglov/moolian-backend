import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.schema';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { FindOneUserParamDto } from './dto/findOneUser.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }


    @Get()
    @ApiResponse({ status: 200, description: 'List of users' })
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 400, description: 'User Not found' })
    async findOne(
        @Param() findOneUserParamDto: FindOneUserParamDto
    ): Promise<User> {
        return this.userService.findOne(findOneUserParamDto);
    }
}