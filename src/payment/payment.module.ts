import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { PaymentProvider } from './payment.provider';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import paymentConfig from 'src/configs/payment.config';
import corsConfig from 'src/configs/cors.config';

@Module({
  imports: [
    ConfigModule.forFeature(paymentConfig),
    ConfigModule.forFeature(corsConfig),
    forwardRef(() => TransactionModule)
  ],
  providers: [PaymentService, PaymentProvider],
  exports: [PaymentProvider],
  controllers: [PaymentController]
})
export class PaymentModule { }
