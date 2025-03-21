import { Module } from '@nestjs/common';
import { FestivalService } from './festival.service';
import { FestivalController } from './festival.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Festival, FestivalSchema } from './festival.schema';
import { ProductModule } from 'src/product/product.module';
import { FestivalProvider } from './festival.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Festival.name, schema: FestivalSchema }]),
    ProductModule
  ],
  controllers: [FestivalController],
  providers: [FestivalService, FestivalProvider],
  exports: [FestivalProvider]
})
export class FestivalModule { }
