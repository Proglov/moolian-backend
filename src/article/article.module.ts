import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './article.schema';
import { ProductModule } from 'src/product/product.module';
import { ImageModule } from 'src/image/image.module';
import { TemporaryImagesModule } from 'src/temporary-images/temporary-images.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    ProductModule,
    ImageModule,
    TemporaryImagesModule
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule { }
