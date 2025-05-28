import { Module } from '@nestjs/common';
import { CronjobService } from './cronjob.service';
import { ScheduleModule } from '@nestjs/schedule';
import { FestivalModule } from 'src/discount-festival/festival.module';
import { ImageModule } from 'src/image/image.module';
import { EmailOTPModule } from 'src/email-otp/email-otp.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    FestivalModule,
    ImageModule,
    EmailOTPModule
  ],
  providers: [CronjobService],
})
export class CronjobModule { }
