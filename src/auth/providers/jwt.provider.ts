import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTProvider {

    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async generateJwtToken(userId: string): Promise<string> {
        try {
            return await this.jwtService.signAsync({ userId })
        } catch (error) {
            throw new RequestTimeoutException(['مشکلی در ایجاد توکن رخ داده است'])
        }
    }

    async extractPayloadAndVerifyToken(token: string): Promise<Object | null> {
        try {
            return await this.jwtService.verifyAsync(token)
        } catch (error) {
            null
        }
    }

}
