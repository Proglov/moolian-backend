import { Module } from '@nestjs/common';
import { EmailProvider } from './email.provider';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import apiConfig from 'src/configs/api.config';


@Module({
  imports: [
    ConfigModule.forFeature(apiConfig),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        defaults: {
          from: configService.getOrThrow('email.from'),
        },
        transport: {
          host: configService.getOrThrow('email.host'),
          port: configService.getOrThrow('email.port'),
          auth: {
            user: configService.getOrThrow('email.username'),
            pass: configService.getOrThrow('email.password'),
          }
        }
      })
    })
  ],
  controllers: [],
  providers: [EmailProvider],
  exports: [EmailProvider]
})
export class EmailModule { }
