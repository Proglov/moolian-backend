import { Module } from "@nestjs/common";
import { CookieProvider } from './cookie.provider';
import { CookieController } from './cookie.controller';


@Module({
  providers: [CookieProvider],
  exports: [CookieProvider],
  controllers: [CookieController]
})
export class CookieModule { }
