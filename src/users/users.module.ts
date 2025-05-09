import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './user.schema';
import { UsersProvider } from './users.provider';
import { AuthModule } from 'src/auth/auth.module';
import { AdminModule } from 'src/admin/admin.module';
import { Admin, AdminSchema } from 'src/admin/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    //!!!!!!! DELETE THIS
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    forwardRef(() => AuthModule),
    AdminModule
  ],
  exports: [UsersProvider],
  controllers: [UsersController],
  providers: [UsersService, UsersProvider],
})
export class UsersModule { }
