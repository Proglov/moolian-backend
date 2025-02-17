import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { requestTimeoutException } from 'src/common/errors';
import { ActiveUserData } from '../interfacesAndType/active-user-data.interface';


/** Class to preform operations related to JWT */
@Injectable()
export class JWTProvider {

    /**
     * Inject the dependencies
     */
    constructor(
        /**
         * Inject the JwtService
         */
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Generate the JWT Token using userId
     */
    async generateJwtToken(userId: string): Promise<string> {
        try {
            return await this.jwtService.signAsync({ userId } as ActiveUserData)
        } catch (error) {
            throw requestTimeoutException('مشکلی در ایجاد توکن رخ داده است')
        }
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
