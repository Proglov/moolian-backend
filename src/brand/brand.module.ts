import { forwardRef, Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './brand.schema';
import { ImageModule } from 'src/image/image.module';
import { TemporaryImagesModule } from 'src/temporary-images/temporary-images.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    ImageModule,
    TemporaryImagesModule,
    forwardRef(() => ProductModule)
  ],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService]
})
export class BrandModule { }
