import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import jwtConfig from '../../configs/jwt.config';
import { ConfigType } from '@nestjs/config';
import { CurrentUserData } from '../interfacesAndType/current-user-data.interface';
import { REFRESH_Cookie_Name } from 'src/common/constants';
import { unauthorizedException } from 'src/common/errors';
import { UsersProvider } from 'src/users/users.provider';
import { HashProvider } from '../providers/password.provider';
import { Types } from 'mongoose';


/** 
 * Class to preform refresh token strategy, 
 * check if the refresh token is valid, 
 * and adding the CurrentUserData to the request 
*/
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {

    private errorMessageRefresh = 'رفرش توکن ناموفق بود';

    /** Inject the dependencies */
    constructor(
        /** Inject jwtConfiguration to access refreshSecret */
        @Inject(jwtConfig.KEY)
        readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

        /** Inject the UsersProvider from Users Module for getting the refresh token from DB  */
        private readonly usersProvider: UsersProvider,

        /** Inject the HashProvider to compare refresh tokens */
        private readonly hashProvider: HashProvider,
    ) {

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request.cookies[REFRESH_Cookie_Name] || null
            ]),
            ignoreExpiration: false,
            secretOrKey: jwtConfiguration.refreshSecret,
            passReqToCallback: true
        });
    }

    async validate(request: Request, payload: CurrentUserData) {
        this.verifyUserRefreshToken(request.cookies[REFRESH_Cookie_Name], payload.userId)
        return { userId: payload.userId }
    }


    /**
     * check the User RefreshToken with one in the DB
     */
    async verifyUserRefreshToken(refreshToken: string, userId: Types.ObjectId): Promise<void> {

        try {
            const user = await this.usersProvider.findOneByID(userId)

            const isSameToken = await this.hashProvider.compareHashed(refreshToken, user.refreshToken)

            //check if the tokens are different
            if (!isSameToken) throw unauthorizedException(this.errorMessageRefresh)

        } catch (error) {
            throw unauthorizedException(this.errorMessageRefresh)
        }

    }
}
