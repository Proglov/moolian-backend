import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ConfigModule } from '@nestjs/config';
import s3StorageConfig from 'src/configs/s3Storage.config';

@Module({
  imports: [ConfigModule.forFeature(s3StorageConfig)],
  controllers: [ImageController],
  providers: [ImageService],
  exports: []
})
export class ImageModule { }
