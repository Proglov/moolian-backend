import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { requestTimeoutException, unauthorizedException } from 'src/common/errors';


/** Class to preform operations related to hashing */
@Injectable()
export class HashProvider {

    /**
     * compare normal string and the hashed string
     */
    async compareHashed(str: string, hashedStr: string): Promise<boolean> {
        try {
            return await compare(str, hashedStr)
        } catch (error) {
            throw unauthorizedException('عملیات تطبیق رمز ناموفق بود')
        }
    }

    /**
     * Hash the string
     */
    async hashString(str: string): Promise<string> {
        try {
            return await hash(str, 10);
        } catch (error) {
            throw requestTimeoutException('مشکلی در رمزنگاری رخ داده است')
        }
    }

}
