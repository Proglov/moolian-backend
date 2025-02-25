import { BadRequestException, NotFoundException, RequestTimeoutException, UnauthorizedException } from "@nestjs/common";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";


export const notFoundMessage = 'Not Found'

export const unauthorizedException = (...messages: string[]) => new UnauthorizedException([...messages]);

export const badRequestException = (...messages: string[]) => new BadRequestException([...messages]);

export const requestTimeoutException = (...messages: string[]) => new RequestTimeoutException([...messages])

export const notFoundException = (...messages: string[]) => new NotFoundException([...messages])


export const validateDTO = async<T extends object>(dto: ClassConstructor<T>, object: any): Promise<Boolean> => {
    const body = plainToInstance(dto, object)
    const errors = await validate(body)
    const errorMessages = errors.flatMap(({ constraints }) => Object.values(constraints));
    if (errorMessages.length > 0) throw badRequestException(...errorMessages)
    return true
}