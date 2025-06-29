import { Controller, Get, HttpCode, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { GetRedirectDto } from './dto/get-redirect.dto';
import { Response } from 'express';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get('get_redirect')
    @ApiOperation({ summary: 'verifies the payment' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Payments found' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Payments are not found' })
    async findAll(
        @Query() query: GetRedirectDto,
        @Res() res: Response
    ) {
        return await this.paymentService.getRedirect(query, res);
    }
}
