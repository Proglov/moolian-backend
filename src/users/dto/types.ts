import { OmitType } from "@nestjs/swagger"
import { CreateUserDto } from "./create-user.dto"
import { User } from "../user.schema"
import { Types } from "mongoose"

/**
 * Type for finding a user by their identifier (phone, username, or email)
 * @typedef {Object} TFindUserByIdentifier
 * @property {string} [phone] - User's phone number
 * @property {string} [username] - User's username
 * @property {string} [email] - User's email address
 */
export type TFindUserByIdentifier = Pick<CreateUserDto, 'phone'> | Pick<CreateUserDto, 'username'> | Pick<CreateUserDto, 'email'>

/**
 * Type for creating a user, excluding the password field
 * @class TCreateUser
 * @extends {OmitType<CreateUserDto, ['password']>}
 */
export class TCreateUser extends OmitType(CreateUserDto, ['password'] as const) {
    _id: Types.ObjectId
}

/**
 * Type for restricted user data, excluding sensitive information like password
 * @class RestrictedUser
 * @extends {OmitType<User, ['password']>}
 */
export class RestrictedUser extends OmitType(User, ['password', 'refreshToken'] as const) { }