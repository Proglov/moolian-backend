import { Injectable } from '@nestjs/common';
import { EmailOTP } from './email-otp.schema';
import { conflictException, forbiddenException, requestTimeoutException } from 'src/common/errors';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VerifyEmailOTPDto } from './dto/verify-email-otp';
import { UsersProvider } from 'src/users/users.provider';
import { randomBytes } from 'crypto';
import { EmailProvider } from 'src/email/email.provider';

@Injectable()
export class EmailOTPService {

    expirationTime = 5 * 60 * 1000 //5 min

    /** Inject the dependencies */
    constructor(
        /**  Inject the EmailOTP Model */
        @InjectModel(EmailOTP.name)
        private readonly emailOTP: Model<EmailOTP>,

        /**  Inject the users provider */
        private readonly usersProvider: UsersProvider,

        /**  Inject the email provider */
        private readonly emailProvider: EmailProvider
    ) { }

    async createEmailOTP(userId: Types.ObjectId): Promise<void> {
        const user = await this.usersProvider.findOneByID(userId);
        if (user.isEmailVerified) throw conflictException('ایمیل شما فعال است')
        try {
            const token = randomBytes(32).toString('hex');
            let emailOTP = await this.emailOTP.findOne({ userId }).exec()
            if (emailOTP) {
                emailOTP.token = token;
            } else {
                emailOTP = new this.emailOTP({ userId, token })
            }
            await emailOTP.save()
            this.emailProvider.emailActivationMessage(user.email, userId.toString(), token)
        } catch (error) {
            throw requestTimeoutException('مشکلی در ذخیره سازی ایمیل او تی پی پیش آمده است')
        }
    }

    async verifyEmailOTP(verifyEmailOTPDto: VerifyEmailOTPDto) {
        try {
            const emailOTP = await this.emailOTP.findOne({ userId: verifyEmailOTPDto.userId })

            if (emailOTP.token !== verifyEmailOTPDto.token)
                throw new Error('forbidden');

            if (Date.now() - emailOTP.createdAt.getTime() > this.expirationTime)
                throw new Error('time');

            await this.usersProvider.updateUserSystematically({ _id: verifyEmailOTPDto.userId }, { isEmailVerified: true })

            await this.emailOTP.deleteOne({ _id: emailOTP._id });

            return 'با موفقیت تایید شد! به صفحه پروفایل خود بروید و صفحه را مجددا بارگذاری کنید'

        } catch (error) {
            if (error.name === 'forbidden')
                throw forbiddenException('توکن صحیح نمیباشد')
            if (error.name === 'time')
                throw forbiddenException('توکن منقضی شده است')

            throw requestTimeoutException('مشکلی در چک کردن ایمیل او تی پی پیش آمده است')
        }
    }

    async isEmailOTPSent(userId: Types.ObjectId) {
        try {
            const emailOTP = await this.emailOTP.findOne({ userId })

            if (!emailOTP) return false

            if (Date.now() - emailOTP.createdAt.getTime() < this.expirationTime)
                return true;

            await this.emailOTP.findByIdAndDelete(emailOTP._id);
            return false;
        } catch (error) {
            throw requestTimeoutException('مشکلی در چک کردن ایمیل او تی پی پیش آمده است')
        }
    }

    async deleteEmailOTPsByDate(date: Date): Promise<void> {
        try {
            await this.emailOTP.deleteMany({
                createdAt: {
                    $lt: date,
                }
            });
        } catch (error) {
            throw requestTimeoutException('مشکلی در پاک کردن ایمیل او تی پی پیش آمده است')
        }
    }
}
