import { applyDecorators, SetMetadata } from '@nestjs/common';
import { AuthType } from '../enums/auth-types';
import { AUTH_TYPE_KEY } from 'src/common/constants';
import { ApiBearerAuth } from '@nestjs/swagger';

// Apply the ApiBearerAuth decorator if it includes bearer or admin
const CustomApiBearerAuth = (...authTypes: AuthType[]) => {
    return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
        if (authTypes.includes(AuthType.Bearer) || authTypes.includes(AuthType.Admin))
            ApiBearerAuth()(target, key, descriptor);
    };
}

export const Auth = (...authTypes: AuthType[]) =>
    applyDecorators(
        SetMetadata(AUTH_TYPE_KEY, authTypes),
        CustomApiBearerAuth(...authTypes),
    );