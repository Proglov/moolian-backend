import { Injectable } from '@nestjs/common';
import { PaymentProvider } from './payment.provider';
import { GetRedirectDto } from './dto/get-redirect.dto';

@Injectable()
export class PaymentService {
    constructor(
        /**  Inject the payment provider */
        private readonly paymentProvider: PaymentProvider
    ) { }

    async getRedirect(
        query: GetRedirectDto
    ) {
        return await this.paymentProvider.getRedirect(query.trackId, query.orderId, query.success, query.status)
    }
}

