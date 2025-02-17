import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { AuthType } from '../enums/auth-types';
import { AUTH_TYPE_KEY } from 'src/common/constants';
import { AdminGuard } from 'src/admin/admin.guard';


/** Class to Authorize Users */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  //? authTypes and their corresponding guards
  private readonly authTypeGuardMap: Record<AuthType, CanActivate | CanActivate[]> = {
    [AuthType.None]: { canActivate: () => true },
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.Admin]: this.adminGuard
  }

  /** Inject the dependencies */
  constructor(
    /** Inject the reflector to get the AuthType MetaData (like admin or none) */
    private readonly reflector: Reflector,

    /**Inject the AccessTokenGuard to Execute if needed */
    private readonly accessTokenGuard: AccessTokenGuard,

    /**Inject the AdminGuard to Execute if needed */
    private readonly adminGuard: AdminGuard,
  ) { }

  /** 
   * Async Function that is used to authorize the user, it is globally applied to all routes and uses other guards and metadata of the route
   * @returns Boolean
   */
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    //* access to the AUTH_TYPE_KEY meta data using the reflector
    //* search both method in the controller (getHandler) and the entire controller for this meta data
    const authTypes: AuthType[] = this.reflector.getAllAndOverride
      (AUTH_TYPE_KEY,
        [context.getHandler(), context.getClass()]
      ) || [AuthType.None]
    if (!authTypes.length) authTypes.push(AuthenticationGuard.defaultAuthType)

    const guards = authTypes.map(type => this.authTypeGuardMap[type]).flat();

    // execute the corresponding guards
    for (const guard of guards) {
      await Promise
        .resolve(guard.canActivate(context))
        .catch(err => { throw err })
    }

    return true;
  }
}
