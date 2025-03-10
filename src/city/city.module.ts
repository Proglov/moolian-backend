import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { City, CitySchema } from './city.schema';
import { ProvinceModule } from 'src/province/province.module';
import { CookieModule } from 'src/cookie/cookie.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    ProvinceModule,
    CookieModule
  ],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule { }
