import { BadRequestException, RequestTimeoutException, UnauthorizedException } from "@nestjs/common";

export const unauthorizedException = (...messages: string[]) => new UnauthorizedException([...messages]);

export const badRequestException = (...messages: string[]) => new BadRequestException([...messages]);

export const requestTimeoutException = (...messages: string[]) => new RequestTimeoutException([...messages])
