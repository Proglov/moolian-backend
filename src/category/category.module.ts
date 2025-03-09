import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './category.schema';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    ImageModule
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule { }
