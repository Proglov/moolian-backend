import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { requestTimeoutException } from 'src/common/errors';


/** Class to preform operations related to email */
@Injectable()
export class EmailProvider {

    /** Inject the dependencies */
    constructor(
        /**  Inject the Email service */
        private readonly mailService: MailerService
    ) { }

    /**
     * Send an Email with the given properties
     */
    async sendMail(to: string, subject: string, text: string) {
        try {
            await this.mailService.sendMail({
                to,
                subject,
                text,
            });
        } catch (error) {
            throw requestTimeoutException('خطایی در ارسال ایمیل رخ داد')
        }
    }
}
