import { Module } from '@nestjs/common';
import { TemporaryImagesService } from './temporary-images.service';
import { TemporaryImage, TemporaryImageSchema } from './temporary-images.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TemporaryImage.name, schema: TemporaryImageSchema }])
  ],
  controllers: [],
  providers: [TemporaryImagesService],
  exports: [TemporaryImagesService],
})
export class TemporaryImagesModule { }
