import { SetMetadata } from '@nestjs/common';
import { AuthType } from '../enums/auth-types';
import { AUTH_TYPE_KEY } from 'src/common/constants';

export const Auth = (...authTypes: AuthType[]) => SetMetadata(AUTH_TYPE_KEY, authTypes);
