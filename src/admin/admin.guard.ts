import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminProvider } from './admin.provider';
import { Request } from 'express';
import { unauthorizedException } from 'src/common/errors';
import { REQUEST_USER_INFO_KEY } from 'src/common/constants';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(
    private readonly adminProvider: AdminProvider
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    //extract request from the execution context
    const request = context.switchToHttp().getRequest();

    //extract the userInfo from the request
    const userInfo = this.extractUserInfoFromTheRequest(request);

    const unauthorizedMessage = 'شما احراز هویت نشده اید'

    if (!userInfo?.userId) throw unauthorizedException(unauthorizedMessage)

    const isAdmin = await this.adminProvider.isAdmin(userInfo.userId)

    if (!isAdmin) throw unauthorizedException(unauthorizedMessage)

    return true;
  }

  private extractUserInfoFromTheRequest(request: Request): { userId: string } | undefined {
    return request[REQUEST_USER_INFO_KEY]
  }
}
