import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { requestTimeoutException, unauthorizedException } from 'src/common/errors';

@Injectable()
export class PasswordProvider {

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            return await compare(password, hashedPassword)
        } catch (error) {
            throw unauthorizedException('عملیات تطبیق رمز عبور ناموفق بود')
        }
    }

    async hashPassword(password: string): Promise<string> {
        try {
            return await hash(password, 10);
        } catch (error) {
            throw requestTimeoutException('مشکلی در رمزنگاری رمزعبور رخ داد')
        }
    }

}
