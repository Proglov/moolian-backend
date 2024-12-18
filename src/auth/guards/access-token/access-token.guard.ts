import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JWTProvider } from 'src/auth/providers/jwt.provider';
import { REQUEST_USER_INFO_KEY } from 'src/common/constants';
import { unauthorizedException } from 'src/common/errors';

@Injectable()
export class AccessTokenGuard implements CanActivate {

  constructor(
    private readonly jWTProvider: JWTProvider
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    //extract request from the execution context
    const request = context.switchToHttp().getRequest();

    //extract the token from the request
    const token = this.extractTokenFromTheRequest(request);

    const unauthorizedMessage = 'شما احراز هویت نشده اید'

    if (!token) throw unauthorizedException(unauthorizedMessage)

    const jwtPayload = await this.jWTProvider.extractPayloadAndVerifyToken(token)

    if (jwtPayload === null) throw unauthorizedException(unauthorizedMessage)

    request[REQUEST_USER_INFO_KEY] = jwtPayload

    return true;
  }


  private extractTokenFromTheRequest(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? []
    return token
  }
}
