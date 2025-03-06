import { OmitType } from "@nestjs/swagger"
import { CreateUserDto } from "./create-user.dto"
import { User } from "../user.schema"

export type TFindUserByIdentifier = Pick<CreateUserDto, 'phone'> | Pick<CreateUserDto, 'username'> | Pick<CreateUserDto, 'email'>


export class TCreateUser extends OmitType(CreateUserDto, ['password'] as const) {
    _id: string | unknown
}

export class RestrictedUser extends OmitType(User, ['password'] as const) { }