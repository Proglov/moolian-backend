import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserSignInWithPhoneDto } from '../dto/user-signIn.dto';
import { CurrentUserData } from '../interfacesAndType/current-user-data.interface';
import { User } from 'src/users/user.schema';
import { unauthorizedException, validateDTO } from 'src/common/errors';
import { UsersProvider } from 'src/users/users.provider';
import { HashProvider } from '../providers/password.provider';


/** 
 * Class to preform local strategy, 
 * verify the  credentials,
 * adding the CurrentUserData to the request 
*/
@Injectable()
export class LocalPhoneStrategy extends PassportStrategy(Strategy, 'local-phone') {

    private errorMessagePhone = 'رمز عبور یا شماره همراه نادرست است';

    constructor(
        /** Inject the UsersProvider from Users Module to find the user  */
        private usersProvider: UsersProvider,

        /** Inject the HashProvider to compare passwords */
        private readonly hashProvider: HashProvider,
    ) {
        super({ usernameField: 'phone', passwordField: 'password' });
    }

    async validate(phone: string, password: string): Promise<CurrentUserData> {
        await validateDTO(UserSignInWithPhoneDto, { phone, password })
        return await this.verifyUserCredentials({ password, phone });
    }

    /**
    * Verify Users with phone number and password
    * @returns CurrentUserData
    */
    async verifyUserCredentials(userSignInWithPhoneDto: UserSignInWithPhoneDto): Promise<CurrentUserData> {
        let user: Pick<User, "password" | "_id"> = undefined

        try {
            user = await this.usersProvider.findOneByIdentifierAndGetPassword({ phone: userSignInWithPhoneDto.phone });

            if (!user) throw unauthorizedException(this.errorMessagePhone)

            const isPasswordTrue = await this.hashProvider.compareHashed(userSignInWithPhoneDto.password, user.password)

            if (!isPasswordTrue) throw unauthorizedException(this.errorMessagePhone)

            return { userId: user._id.toHexString() }
        } catch (error) {
            throw unauthorizedException(this.errorMessagePhone)
        }
    }
}
