import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.schema';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { FindOneUserParamDto } from './dto/findOneUser.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @UseGuards(AccessTokenGuard)
    @Get(':id')
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User Not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async findOne(
        @Param() findOneUserParamDto: FindOneUserParamDto
    ): Promise<Omit<User, 'password'>> {
        return this.userService.findOne(findOneUserParamDto);
    }
}