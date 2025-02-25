import { Injectable } from '@nestjs/common';
import { Response } from 'express';


/** Class to preform operations related to Cookies */
@Injectable()
export class CookieProvider {

    private isProduction = process.env.NODE_ENV === 'production'

    /**
     * Add http only Cookie to the Request
     */
    addCookie(response: Response, name: string, data: any, expiresIn: number): void {
        const expires = new Date()
        expires.setTime(expires.getTime() + expiresIn * 1000)

        response.cookie(name, data, {
            httpOnly: this.isProduction,
            secure: this.isProduction,
            sameSite: 'none',
            expires
        })
    }

    /**
     * remove the Cookie
     */
    removeCookie(response: Response, name: string): void {

        response.cookie(name, '', {
            httpOnly: this.isProduction,
            secure: this.isProduction,
            sameSite: 'none',
            expires: new Date(0), // Set to a date in the past to remove the cookie
        })
    }

}
