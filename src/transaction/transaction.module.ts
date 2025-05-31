import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { ProductModule } from 'src/product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './transaction.schema';
import { TransactionProvider } from './transaction.provider';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { PaymentModule } from 'src/payment/payment.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    ProductModule,
    FirebaseModule,
    forwardRef(() => PaymentModule),
    UsersModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionProvider],
  exports: [TransactionProvider]
})
export class TransactionModule { }
