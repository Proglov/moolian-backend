import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';

@Controller('cookie')
export class CookieController {

    @Auth(AuthType.Admin)
    @Get('get-my-cookies')
    getMyCookies(
        @Req() req: Request
    ) {
        return req.cookies
    }
}
