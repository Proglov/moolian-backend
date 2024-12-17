import { OmitType } from "@nestjs/swagger"
import { CreateUserDto } from "./create-user.dto"

export type TFindUserByIdentifier = Pick<CreateUserDto, 'phone'> | Pick<CreateUserDto, 'username'> | Pick<CreateUserDto, 'email'>


export class TCreateUser extends OmitType(CreateUserDto, ['password'] as const) {
    _id: string | unknown
}