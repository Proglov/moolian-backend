import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { requestTimeoutException } from 'src/common/errors';
import { CurrentUserData } from '../interfacesAndType/current-user-data.interface';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { Tokens } from '../interfacesAndType/Tokens.interface';



/** Class to preform operations related to JWT */
@Injectable()
export class JWTProvider {

    /** Inject the dependencies */
    constructor(
        /** Inject the JwtService to Generate and Verify Tokens  */
        private readonly jwtService: JwtService,

        /** Inject jwtConfiguration to access TTLs */
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) { }


    /**
     * Sign the JWT Token using userId
     */
    public async signToken(userId: string, expiresIn: string, secret: string) {
        try {
            return await this.jwtService.signAsync({ userId }, { expiresIn, secret });
        } catch (error) {
            throw requestTimeoutException('مشکلی در ایجاد توکن رخ داده است')
        }
    }

    /**
     * Generate the JWT Tokens
     */
    async generateJwtTokens(userId: string): Promise<Tokens> {
        const [accessToken, refreshToken] = await Promise.all([
            this.signToken(userId, this.jwtConfiguration.accessTokenTtl + 's', this.jwtConfiguration.secret),
            this.signToken(userId, this.jwtConfiguration.refreshTokenTtl + 's', this.jwtConfiguration.refreshSecret),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Extract the JWT Token and get the CurrentUserData
     */
    async extractPayloadAndVerifyToken(token: string): Promise<CurrentUserData | null> {
        try {
            return await this.jwtService.verifyAsync(token)
        } catch (error) {
            return null
        }
    }

}
