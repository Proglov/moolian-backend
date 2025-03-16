import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { CurrentUserData } from '../interfacesAndType/current-user-data.interface';
import { User } from 'src/users/user.schema';
import { unauthorizedException, validateDTO } from 'src/common/errors';
import { UsersProvider } from 'src/users/users.provider';
import { HashProvider } from '../providers/password.provider';
import { UserSignInWithUsernameOrEmailDto } from '../dto/user-signIn.dto';
import { isEmail } from 'class-validator';
import { TFindUserByIdentifier } from 'src/users/dto/types';


/** 
 * Class to preform local strategy, 
 * verify the  credentials,
 * adding the CurrentUserData to the request 
*/
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {

    private errorMessageEmailOrUsername = 'رمز عبور یا ایمیل یا نام کاربری نادرست است';

    constructor(
        /** Inject the UsersProvider from Users Module to find the user  */
        private usersProvider: UsersProvider,

        /** Inject the HashProvider to compare passwords */
        private readonly hashProvider: HashProvider,
    ) {
        super({ usernameField: 'emailOrUsername', passwordField: 'password' });
    }

    async validate(emailOrUsername: string, password: string): Promise<CurrentUserData> {
        await validateDTO(UserSignInWithUsernameOrEmailDto, { emailOrUsername, password })
        return await this.verifyUserCredentials({ password, emailOrUsername });
    }

    /**
    * Verify Users with phone number and password
    * @returns CurrentUserData
    */
    async verifyUserCredentials(userSignInWithUsernameOrEmailDto: UserSignInWithUsernameOrEmailDto): Promise<CurrentUserData> {
        let user: Pick<User, "password" | "_id"> = undefined

        try {
            const queryObj = {}

            //check if the input is email
            if (isEmail(userSignInWithUsernameOrEmailDto.emailOrUsername))
                queryObj['email'] = userSignInWithUsernameOrEmailDto.emailOrUsername.toLocaleLowerCase()
            else queryObj['username'] = userSignInWithUsernameOrEmailDto.emailOrUsername

            //find the user by the query object
            user = await this.usersProvider.findOneByIdentifierAndGetPassword(queryObj as TFindUserByIdentifier);
            if (!user) throw unauthorizedException(this.errorMessageEmailOrUsername)

            const isPasswordTrue = await this.hashProvider.compareHashed(userSignInWithUsernameOrEmailDto.password, user.password)

            if (!isPasswordTrue) throw unauthorizedException(this.errorMessageEmailOrUsername)

            return { userId: user._id }
        } catch (error) {
            throw unauthorizedException(this.errorMessageEmailOrUsername)
        }
    }
}
