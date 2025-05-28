import { Module } from '@nestjs/common';
import { EmailOTPService } from './email-otp.service';
import { EmailOTP, EmailOTPSchema } from './email-otp.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { EmailOTPController } from './email-otp.controller';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EmailOTP.name, schema: EmailOTPSchema }]),
    UsersModule,
    EmailModule
  ],
  controllers: [EmailOTPController],
  providers: [EmailOTPService],
  exports: [EmailOTPService],
})
export class EmailOTPModule { }
