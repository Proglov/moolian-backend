import axios from 'axios';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'src/transaction/transaction.schema';
import { TransactionProvider } from 'src/transaction/transaction.provider';
import { Status } from 'src/transaction/enums/transaction.enums';
import paypingConfig from 'src/configs/payping.config';
import { ConfigType } from '@nestjs/config';
import apiConfig from 'src/configs/api.config';
import { badRequestException, forbiddenException, internalServerErrorException, notFoundException, unauthorizedException } from 'src/common/errors';
import { Types } from 'mongoose';

@Injectable()
export class PaymentProvider {

    private readonly PAYPING_BASE_URL = 'https://api.payping.ir/v2/pay';
    private readonly PAYPING_REDIRECT_URL = `${this.PAYPING_BASE_URL}/gotoipg`;
    private readonly PAYPING_VERIFY_URL = `${this.PAYPING_BASE_URL}/verify`;

    constructor(
        /**  Inject the transaction provider */
        @Inject(forwardRef(() => TransactionProvider))
        private readonly transactionProvider: TransactionProvider,

        /** Inject payping config to access api key */
        @Inject(paypingConfig.KEY)
        private readonly paypingConfiguration: ConfigType<typeof paypingConfig>,

        /** Inject api config to access back end url */
        @Inject(apiConfig.KEY)
        private readonly apiConfiguration: ConfigType<typeof apiConfig>
    ) { }

    async requestPayment(transaction: Transaction, payerIdentity: string): Promise<string> {

        const payload = {
            amount: transaction.totalPrice,
            payerIdentity,
            returnUrl: `${this.apiConfiguration.url}/payment/get_redirect`,
            clientRefId: transaction._id.toString(),
            description: `Payment for order transaction: ${transaction._id}`
        };

        try {
            const response = await axios.post(
                this.PAYPING_BASE_URL,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${this.paypingConfiguration.apiKey}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.data.code) throw new Error('پرداخت ناموفق')
            return `${this.PAYPING_REDIRECT_URL}/${response.data.code}`;
        } catch (error) {
            this.handlePaypingError(error);
        }

    }

    async getRedirect(refId: string, clientRefId: string, cardNumber: string, cardHashPan: string) {
        if (!cardNumber || !cardHashPan) throw forbiddenException('پرداخت تراکنش ناموف بوده است')

        const transaction = await this.transactionProvider.findOne({ id: new Types.ObjectId(clientRefId) });

        try {
            const response = await axios.post(
                this.PAYPING_VERIFY_URL,
                {
                    amount: transaction.totalPrice,
                    refid: refId
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.paypingConfiguration.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.amount !== transaction.totalPrice)
                throw forbiddenException('پرداخت ناموفق بوده است')

            await this.transactionProvider.approvePayment({ id: new Types.ObjectId(clientRefId) }, { status: Status.Requested }, refId);

            return 'تراکنش با موفقیت تکمیل شد';
        } catch (error) {
            this.handlePaypingError(error);
        }
    }

    private handlePaypingError(error: any): never {
        if (!axios.isAxiosError(error)) {
            throw internalServerErrorException('خطای ناشناخته در ارتباط با درگاه پرداخت');
        }

        const errorData = error.response?.data;
        const errorCode = errorData?.code || errorData?.StatusCode;

        if (!errorCode) throw forbiddenException('پرداخت ناموفق بود')

        switch (errorCode) {
            case 400:
                throw badRequestException(errorData?.Message || 'پارامترهای درخواست نامعتبر است');
            case 401:
            case 403:
                throw unauthorizedException('احراز هویت درگاه پرداخت نامعتبر است');
            case 404:
                throw notFoundException('تراکنش یافت نشد');
            case 500:
                throw internalServerErrorException('مشکلی در سرور رخ داده است');
            case 503:
                throw internalServerErrorException('درگاه پرداخت موقتاً در دسترس نیست');
            default:
                throw internalServerErrorException(
                    errorData?.Message || 'خطای ناشناخته از سمت درگاه پرداخت'
                );
        }
    }
}

