import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { ImageModule } from 'src/image/image.module';
import { BrandModule } from 'src/brand/brand.module';
import { NoteModule } from 'src/note/note.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ImageModule,
    BrandModule,
    NoteModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule { }
