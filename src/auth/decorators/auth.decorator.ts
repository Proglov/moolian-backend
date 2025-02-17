import { applyDecorators, SetMetadata } from '@nestjs/common';
import { AuthType } from '../enums/auth-types';
import { AUTH_TYPE_KEY } from 'src/common/constants';
import { ApiBearerAuth } from '@nestjs/swagger';

// Apply the ApiBearerAuth decorator (for swagger documentation) if it includes bearer or admin
const CustomApiBearerAuth = (...authTypes: AuthType[]) => {
    return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
        if (authTypes.includes(AuthType.Bearer) || authTypes.includes(AuthType.Admin))
            ApiBearerAuth()(target, key, descriptor);
    };
}

//compose multiple decorators
export const Auth = (...authTypes: AuthType[]) =>
    applyDecorators(
        SetMetadata(AUTH_TYPE_KEY, authTypes),
        CustomApiBearerAuth(...authTypes),
    );



//?  _____ THIS IS HOW YOU USE THE SetMetaData _____
//? |                                              |
//? | @SetMetadata('key', 'value')                 |
//? | class CustomClass {}                         |
//? |______________________________________________|



//?  ________________ THIS IS HOW YOU CREATE A DECORATOR ________________________
//? |                                                                           |
//? | const CustomDecorator = (...args: string[]) => SetMetaData('key', [args]) |
//? |___________________________________________________________________________|