import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { PaymentProvider } from './payment.provider';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import bitpayConfig from 'src/configs/payping.config';
import apiConfig from 'src/configs/api.config';

@Module({
  imports: [
    ConfigModule.forFeature(bitpayConfig),
    ConfigModule.forFeature(apiConfig),
    forwardRef(() => TransactionModule)
  ],
  providers: [PaymentService, PaymentProvider],
  exports: [PaymentProvider],
  controllers: [PaymentController]
})
export class PaymentModule { }
