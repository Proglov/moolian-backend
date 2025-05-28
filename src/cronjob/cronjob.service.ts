import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FestivalProvider } from 'src/discount-festival/festival.provider';
import { EmailOTPService } from 'src/email-otp/email-otp.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class CronjobService {

    /** Inject the dependencies */
    constructor(
        /**  Inject the Image service */
        private readonly imageService: ImageService,

        /**  Inject the Festival provider */
        private readonly festivalProvider: FestivalProvider,

        /**  Inject the EmailOTP service */
        private readonly emailOTPService: EmailOTPService
    ) { }

    @Cron('0 0 15,21 * * *', { timeZone: 'Asia/Tehran' })
    async unusedImages() {
        Logger.log('unusedImages Cron Job is started!'.cyan);
        try {
            await this.imageService.deleteOldTemporaryImages()
            Logger.log('unusedImages Cron Job is successfully finished!'.bgGreen);
        } catch (error) {
            Logger.error('some thing went wrong during deleting unused images')
            Logger.error(error)
        }
    }

    @Cron('0 5 0 * * *', { timeZone: 'Asia/Tehran' })
    async festivals() {
        Logger.log('festivals Cron Job is started!'.cyan);
        try {
            await this.festivalProvider.removeExpiredFestivals()
            Logger.log('festivals Cron Job is successfully finished!'.bgGreen);
        } catch (error) {
            Logger.error('some thing went wrong during deleting festivals')
            Logger.error(error)
        }
    }

    @Cron('0 0 0,5,10,15 * * *', { timeZone: 'Asia/Tehran' })
    async emailOTP() {
        Logger.log('emailOTP Cron Job is started!'.cyan);
        try {
            const date = new Date()
            date.setMinutes(date.getMinutes() - 10)
            await this.emailOTPService.deleteEmailOTPsByDate(date)
            Logger.log('emailOTP Cron Job is successfully finished!'.bgGreen);
        } catch (error) {
            Logger.error('some thing went wrong during deleting emailOTP')
            Logger.error(error)
        }
    }
}