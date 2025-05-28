import { Controller, Post, HttpStatus, HttpCode, Query, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailOTPService } from './email-otp.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { VerifyEmailOTPDto } from './dto/verify-email-otp';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';


/**
 * End points related to the EmailOTP operations
 */
@Controller('emailOTP')
export class EmailOTPController {

    /** Inject the dependencies */
    constructor(
        /**  Inject the emailOTP service */
        private readonly emailOTPService: EmailOTPService
    ) { }


    /** create an emailOTP */
    @Auth(AuthType.Bearer)
    @Post()
    @ApiOperation({ summary: 'creates an emailOTP' })
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({ status: HttpStatus.CREATED, description: 'EmailOTP created' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'email is already activated' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'wrong credentials' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'EmailOTP is not created' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async create(
        @CurrentUser() userInfo: CurrentUserData
    ) {
        return await this.emailOTPService.createEmailOTP(userInfo.userId);
    }

    /** verify an emailOTP */
    @Get()
    @ApiOperation({ summary: 'verifies an emailOTP' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'EmailOTP verified' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'wrong credentials' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'wrong credentials' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'EmailOTP is not verified' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async verify(
        @Query() verifyEmailOTPDto: VerifyEmailOTPDto
    ) {
        return await this.emailOTPService.verifyEmailOTP(verifyEmailOTPDto);
    }

    /** verify an emailOTP */
    @Auth(AuthType.Bearer)
    @Get('isSent')
    @ApiOperation({ summary: 'verifies an emailOTP' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'EmailOTP checked' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'EmailOTP check is not succeeded' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async isEmailOTPSent(
        @CurrentUser() userInfo: CurrentUserData
    ) {
        return await this.emailOTPService.isEmailOTPSent(userInfo.userId);
    }

}