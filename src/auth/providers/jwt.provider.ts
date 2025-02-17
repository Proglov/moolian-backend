import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { requestTimeoutException } from 'src/common/errors';
import { ActiveUserData } from '../interfacesAndType/active-user-data.interface';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { TAuthResponse } from '../interfacesAndType/auth.response-type';


/** Class to preform operations related to JWT */
@Injectable()
export class JWTProvider {

    /**
     * Inject the dependencies
     */
    constructor(
        /**
         * Inject the JwtService to Generate and Verify Tokens
         */
        private readonly jwtService: JwtService,

        /**
        * Inject jwtConfiguration to access TTLs
        */
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) { }


    /**
     * Sign the JWT Token using userId
     */
    public async signToken(userId: string, expiresIn: number) {
        try {
            return await this.jwtService.signAsync({ userId }, { expiresIn });
        } catch (error) {
            throw requestTimeoutException('مشکلی در ایجاد توکن رخ داده است')
        }
    }

    /**
     * Generate the JWT Tokens
     */
    async generateJwtTokens(userId: string): Promise<TAuthResponse> {
        const [accessToken, refreshToken] = await Promise.all([
            this.signToken(userId, this.jwtConfiguration.accessTokenTtl),
            this.signToken(userId, this.jwtConfiguration.refreshTokenTtl),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Extract the JWT Token and get the userId
     */
    async extractPayloadAndVerifyToken(token: string): Promise<ActiveUserData | null> {
        try {
            return await this.jwtService.verifyAsync(token)
        } catch (error) {
            return null
        }
    }

}
