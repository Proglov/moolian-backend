import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminProvider } from './admin.provider';
import { unauthorizedException } from 'src/common/errors';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';


/** Class to Guard Admin Routes */
@Injectable()
export class AdminGuard implements CanActivate {

  /** Inject the dependencies */
  constructor(

    /** Inject AdminProvider, use it to retrieve the REQUEST_USER_INFO_KEY */
    private readonly adminProvider: AdminProvider,

    /** Inject AccessTokenGuard */
    private readonly jWTAuthGuard: JWTAuthGuard
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
      .resolve(this.jWTAuthGuard.canActivate(context))
      .catch(err => { throw err })

    //extract request from the execution context
    const request = context.switchToHttp().getRequest();

    //extract the user from the request
    const userInfo: CurrentUserData | null = request?.user

    const unauthorizedMessage = 'شما احراز هویت نشده اید'

    if (!userInfo?.userId) throw unauthorizedException(unauthorizedMessage)

    const isAdmin = await this.adminProvider.isAdmin(userInfo.userId)

    if (!isAdmin) throw unauthorizedException(unauthorizedMessage)

    return true;
  }

}
