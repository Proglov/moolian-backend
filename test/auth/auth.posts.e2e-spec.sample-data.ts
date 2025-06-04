import { faker } from '@faker-js/faker';
import { User } from 'src/users/user.schema';
import { Document, Types } from 'mongoose';
import { UserSignupDto } from 'src/auth/dto/user-signup.dto';


type UserProperties = Omit<User, keyof Document> & { _id: Types.ObjectId };

const completeUser: UserProperties = {
    _id: new Types.ObjectId(),
    username: faker.internet.username().padEnd(8, '0').slice(0, 10),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: '09367087010',
    name: faker.person.fullName(),
    address: [
        faker.location.streetAddress(),
        faker.location.secondaryAddress(),
    ],
    isEmailVerified: false,
    isPhoneVerified: false,
    refreshToken: faker.string.uuid()
};

export const signupUser: UserSignupDto = {
    username: completeUser.username,
    password: completeUser.password,
    phone: completeUser.phone,
    email: completeUser.email
}

export const missingEmail = {
    ...signupUser,
    email: undefined
}