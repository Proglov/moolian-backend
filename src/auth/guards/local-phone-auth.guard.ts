
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalPhoneAuthGuard extends AuthGuard('local-phone') { }
