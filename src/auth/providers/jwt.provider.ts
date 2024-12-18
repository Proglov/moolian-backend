import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { requestTimeoutException } from 'src/common/errors';
import { ActiveUserData } from '../interfacesAndType/active-user-data.interface';

@Injectable()
export class JWTProvider {

    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async generateJwtToken(userId: string): Promise<string> {
        try {
            return await this.jwtService.signAsync({ userId } as ActiveUserData)
        } catch (error) {
            throw requestTimeoutException('مشکلی در ایجاد توکن رخ داده است')
        }
    }

    async extractPayloadAndVerifyToken(token: string): Promise<ActiveUserData | null> {
        try {
            return await this.jwtService.verifyAsync(token)
        } catch (error) {
            null
        }
    }

}
