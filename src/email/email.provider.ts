import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { requestTimeoutException } from 'src/common/errors';
import apiConfig from 'src/configs/api.config';
import { ConfigType } from '@nestjs/config';


/** Class to preform operations related to email */
@Injectable()
export class EmailProvider {

    /** Inject the dependencies */
    constructor(
        /**  Inject the Email service */
        private readonly mailService: MailerService,

        /** Inject api config to access back end url */
        @Inject(apiConfig.KEY)
        private readonly apiConfiguration: ConfigType<typeof apiConfig>,
    ) { }

    /**
     * Send an Email with the given properties
     */
    async sendMail(to: string, subject: string, html: string) {
        try {
            await this.mailService.sendMail({
                to,
                subject,
                html,
            });
        } catch (error) {
            throw requestTimeoutException('خطایی در ارسال ایمیل رخ داد')
        }
    }

    async emailActivationMessage(to: string, userId: string, token: string) {
        const api = `${this.apiConfiguration.url}/emailOTP?userId=${userId}&token=${token}`
        const message = `
            <!DOCTYPE html>
            <html lang="fa" dir="rtl">

            <head>
                <meta charset="UTF-8" />
                <title>فعال‌سازی ایمیل</title>
                <style>
                    body {
                        font-family: Tahoma, Arial, sans-serif;
                        background-color: #f4f4f7;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                        direction: rtl;
                    }

                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                        text-align: right;
                    }

                    h1 {
                        color: #2c3e50;
                    }

                    p {
                        font-size: 16px;
                        line-height: 1.5;
                    }

                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        margin-top: 20px;
                        background-color: #4CAF50;
                        color: white !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }

                    .footer {
                        margin-top: 30px;
                        font-size: 12px;
                        color: #888888;
                    }
                </style>
            </head>

            <body>
                <div class="container">
                    <h1>فعال‌سازی ایمیل شما</h1>
                    <p>سلام،</p>
                    <p>از ثبت‌نام شما سپاسگزاریم. لطفاً برای تایید آدرس ایمیل و فعال‌سازی حساب خود، روی دکمه زیر کلیک کنید:</p>
                    <a href="${api}" class="button">تایید ایمیل</a>
                    <p>اگر دکمه بالا کار نکرد، لطفاً لینک زیر را کپی کرده و در مرورگر خود وارد کنید:</p>
                    <p><a href="${api}">${api}</a>
                    </p>
                    <p>اگر شما این حساب را ایجاد نکرده‌اید، نیاز به انجام هیچ کاری نیست.</p>
                    <div class="footer">
                        &copy; ۲۰۲۵ مولیان پرفیوم. تمامی حقوق محفوظ است.
                    </div>
                </div>
            </body>

            </html>
        `
        await this.sendMail(to, 'تایید ایمیل', message)
    }
}
