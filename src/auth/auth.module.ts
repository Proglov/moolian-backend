import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PasswordProvider } from './providers/password.provider';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JWTProvider } from './providers/jwt.provider';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider())
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordProvider, JWTProvider],
  exports: [PasswordProvider, JWTProvider]
})
export class AuthModule { }
