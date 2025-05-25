import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import appConfig from './configs/app.config';
import databaseConfig from './configs/database.config';
import emailConfig from './configs/email.config';
import corsConfig from './configs/cors.config';
import environmentValidation from './configs/environment.validation';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './auth/guards/authentication.guard';
import { AdminGuard } from './admin/admin.guard';
import { JWTAuthGuard } from './auth/guards/jwt-auth.guard';
import { ImageModule } from './image/image.module';
import { TemporaryImagesModule } from './temporary-images/temporary-images.module';
import { ProvinceModule } from './province/province.module';
import { CityModule } from './city/city.module';
import { ProductModule } from './product/product.module';
import { NoteModule } from './note/note.module';
import { BrandModule } from './brand/brand.module';
import { CommentModule } from './comment/comment.module';
import { TransactionModule } from './transaction/transaction.module';
import { FestivalModule } from './discount-festival/festival.module';
import { ArticleModule } from './article/article.module';
import { CronjobModule } from './cronjob/cronjob.module';
import { FirebaseModule } from './firebase/firebase.module';


const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV === 'development' ? '.env.development' : ENV === 'test' ? '.env.test' : '.env',
      load: [appConfig, databaseConfig, emailConfig, corsConfig],
      validationSchema: environmentValidation,
      cache: ENV === 'production'
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('database.URI')
      })
    }),
    CronjobModule,
    UsersModule,
    AuthModule,
    AdminModule,
    // EmailModule,
    ImageModule,
    TemporaryImagesModule,
    ProvinceModule,
    CityModule,
    ProductModule,
    NoteModule,
    BrandModule,
    CommentModule,
    TransactionModule,
    FestivalModule,
    ArticleModule,
    FirebaseModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    AdminGuard,
    JWTAuthGuard
  ],
})
export class AppModule { }
