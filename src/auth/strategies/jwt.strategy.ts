import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import jwtConfig from '../../configs/jwt.config';
import { ConfigType } from '@nestjs/config';
import { CurrentUserData } from '../interfacesAndType/current-user-data.interface';
import { JWT_Cookie_Name } from 'src/common/constants';


/** Class to preform jwt strategy, adding the CurrentUserData to the request */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    /** Inject the dependencies */
    constructor(
        /** Inject jwtConfiguration to access secret */
        @Inject(jwtConfig.KEY)
        readonly jwtConfiguration: ConfigType<typeof jwtConfig>
    ) {

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request.cookies[JWT_Cookie_Name] || null
            ]),
            ignoreExpiration: false,
            secretOrKey: jwtConfiguration.secret,
        });
    }

    async validate(payload: CurrentUserData) {
        return payload
    }
}
