import { Injectable } from '@nestjs/common';
import { PaymentProvider } from './payment.provider';
import { GetRedirectDto } from './dto/get-redirect.dto';
import { Response } from 'express';

@Injectable()
export class PaymentService {
    constructor(
        /**  Inject the payment provider */
        private readonly paymentProvider: PaymentProvider
    ) { }

    async getRedirect(
        query: GetRedirectDto,
        res: Response
    ) {
        const resultUrl = await this.paymentProvider.getRedirect(query.trackId, query.orderId, query.success, query.status)
        return res.redirect(resultUrl);
    }
}

