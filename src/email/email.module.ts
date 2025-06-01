import { Module } from '@nestjs/common';
import { EmailProvider } from './email.provider';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import emailConfig from 'src/configs/email.config';


@Module({
  imports: [
    ConfigModule,
    ConfigModule.forRoot({ load: [emailConfig] }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const emailCfg = configService.get<ReturnType<typeof emailConfig>>('email');
        return {
          defaults: {
            from: emailCfg.from,
          },
          transport: {
            host: emailCfg.host,
            port: Number(emailCfg.port),
            auth: {
              user: emailCfg.username,
              pass: emailCfg.password,
            },
          },
        };
      },
    }),
  ],
  controllers: [],
  providers: [EmailProvider],
  exports: [EmailProvider]
})
export class EmailModule { }
