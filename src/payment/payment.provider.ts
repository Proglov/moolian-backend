import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'src/transaction/transaction.schema';
import { TransactionProvider } from 'src/transaction/transaction.provider';
import { Status } from 'src/transaction/enums/transaction.enums';
import paymentConfig from 'src/configs/payment.config';
import { ConfigType } from '@nestjs/config';
import apiConfig from 'src/configs/api.config';
import { forbiddenException, internalServerErrorException } from 'src/common/errors';
import { Types } from 'mongoose';
const Zibal = require('zibal');

@Injectable()
export class PaymentProvider {
    private readonly zibal: any;

    constructor(
        /**  Inject the transaction provider */
        @Inject(forwardRef(() => TransactionProvider))
        private readonly transactionProvider: TransactionProvider,

        /** Inject zibal config to access api key */
        @Inject(paymentConfig.KEY)
        private readonly paymentConfiguration: ConfigType<typeof paymentConfig>,

        /** Inject api config to access back end url */
        @Inject(apiConfig.KEY)
        private readonly apiConfiguration: ConfigType<typeof apiConfig>
    ) {
        this.zibal = new Zibal({
            merchant: this.paymentConfiguration.merchantKey,
            callbackUrl: `${this.apiConfiguration.url}/payment/get_redirect`,
            token: this.paymentConfiguration.zibalToken
        });
    }

    async requestPayment(transaction: Transaction, payerIdentity: string): Promise<string> {

        const payload = {
            amount: transaction.totalPrice,
            mobile: payerIdentity,
            orderId: transaction._id.toString(),
            description: `Payment for order transaction: ${transaction._id}`,
        };

        try {
            const response = await this.zibal.request(payload);
            if (!response.success) {
                throw forbiddenException(response.persianMessage || 'پرداخت ناموفق');
            }

            return response.paymentUrl;
        } catch (error) {
            this.handleZibalError(error);
        }

    }

    async getRedirect(trackId: string, orderId: string, success: string, _status: string) {
        const isSuccess = success === '1';

        // You may want to check the status code as well
        if (!isSuccess) {
            throw forbiddenException('پرداخت ناموفق بوده است');
        }

        const transaction = await this.transactionProvider.findOne({ id: new Types.ObjectId(orderId) });

        try {

            const response = await this.zibal.verify({ trackId: Number(trackId) });

            if (!response.success || response.amount !== transaction.totalPrice) {
                throw forbiddenException('پرداخت ناموفق بوده است');
            }

            await this.transactionProvider.approvePayment({ id: new Types.ObjectId(orderId) }, { status: Status.Requested }, trackId.toString());

            return 'تراکنش با موفقیت تکمیل شد';
        } catch (error) {
            this.handleZibalError(error);
        }
    }

    private handleZibalError(error: any): never {
        const message = error?.persianMessage || error?.message || 'خطای ناشناخته در ارتباط با درگاه پرداخت';
        throw internalServerErrorException(message);
    }
}

