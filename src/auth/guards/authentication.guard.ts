import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { AuthType } from '../enums/auth-types';
import { AUTH_TYPE_KEY } from 'src/common/constants';
import { AdminGuard } from 'src/admin/admin.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<AuthType, CanActivate | CanActivate[]> = {
    [AuthType.None]: { canActivate: () => true },
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.Admin]: this.adminGuard
  }

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly adminGuard: AdminGuard,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const authTypes: AuthType[] = this.reflector.getAllAndOverride
      (AUTH_TYPE_KEY,
        [context.getHandler(), context.getClass()]
      ) || [AuthType.None]
    if (!authTypes.length) authTypes.push(AuthenticationGuard.defaultAuthType)

    const guards = authTypes.map(type => this.authTypeGuardMap[type]).flat();

    for (const guard of guards) {
      await Promise
        .resolve(guard.canActivate(context))
        .catch(err => { throw err })
    }

    return true;
  }
}
