import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminProvider } from './admin.provider';
import { Request } from 'express';
import { unauthorizedException } from 'src/common/errors';
import { REQUEST_USER_INFO_KEY } from 'src/common/constants';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';


/** Class to Guard Admin Routes */
@Injectable()
export class AdminGuard implements CanActivate {

  /** Inject the dependencies */
  constructor(

    /** Inject AdminProvider, use it to retrieve the REQUEST_USER_INFO_KEY */
    private readonly adminProvider: AdminProvider,

    /** Inject AccessTokenGuard */
    private readonly accessTokenGuard: AccessTokenGuard,
  ) { }


  /**
    * Async Function that is needed to authorize the user
    * @returns Boolean
    */
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    //extract the userInfo, throw error if no valid JWT Token
    await Promise
      .resolve(this.accessTokenGuard.canActivate(context))
      .catch(err => { throw err })

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

  /** function to extract the REQUEST_USER_INFO_KEY from the request */
  private extractUserInfoFromTheRequest(request: Request): { userId: string } | undefined {
    return request[REQUEST_USER_INFO_KEY]
  }
}
