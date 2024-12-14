import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './user.schema';
import { UsersProvider } from './users.provider';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  exports: [UsersProvider],
  controllers: [UsersController],
  providers: [UsersService, UsersProvider],
})
export class UsersModule { }
