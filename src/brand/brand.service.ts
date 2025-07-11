import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './brand.schema';
import { Model, Types } from 'mongoose';
import { badRequestException, conflictException, notFoundException, requestTimeoutException } from 'src/common/errors';
import { ImageService } from 'src/image/image.service';
import { FindAllDto } from 'src/common/findAll.dto';
import { FindOneDto } from 'src/common/findOne.dto';
import { TemporaryImagesService } from 'src/temporary-images/temporary-images.service';
import { ProductProvider } from 'src/product/product.provider';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Brand Model */
    @InjectModel(Brand.name)
    private readonly brandModel: Model<Brand>,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

    /**  Inject the Temporary images service to delete temp images after product has been created */
    private readonly temporaryImagesService: TemporaryImagesService,

    /**  Inject the product provider to count the products of a brand*/
    @Inject(forwardRef(() => ProductProvider))
    private readonly productProvider: ProductProvider
  ) { }

  async create(createBrandDto: CreateBrandDto, replaceTheImageKey?: boolean): Promise<Brand> {
    try {
      const newBrand = new this.brandModel(createBrandDto)
      const brand = (await newBrand.save()).toObject()
      if (!replaceTheImageKey)
        return brand

      //* delete the temporary image
      await this.temporaryImagesService.deleteTemporaryImagesByNames([createBrandDto.imageKey])

      return (this.imageService.replaceTheImageKey([brand]))[0]
    } catch (error) {
      //* mongoose duplication error
      if (error?.code === 11000 && (Object.keys(error?.keyPattern)[0] === 'nameFA' || Object.keys(error?.keyPattern)[0] === 'nameEN'))
        throw badRequestException('برندی با همین نام موجود است')

      throw requestTimeoutException('مشکلی در ایجاد برند رخ داده است')
    }
  }

  async findAll(limit: number, page: number, replaceTheImageKey?: boolean): Promise<FindAllDto<Brand>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.brandModel.find().skip(skip).limit(limit)

      let [brands, count] = await Promise.all([
        query.lean().exec() as unknown as Brand[],
        this.brandModel.countDocuments()
      ]);

      if (replaceTheImageKey)
        brands = this.imageService.replaceTheImageKey(brands)

      return {
        count,
        items: brands
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن برند ها رخ داده است')
    }
  }

  async findOne(findOneDto: FindOneDto, replaceTheImageKey?: boolean): Promise<Brand> {
    try {
      const brand = await this.brandModel.findById(findOneDto.id).lean().exec();
      if (!replaceTheImageKey)
        return brand
      return (this.imageService.replaceTheImageKey([brand]))[0]
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی برند مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن برند رخ داده است')
    }
  }

  async deleteOne(id: Types.ObjectId) {
    const count = await this.productProvider.countProductsOfABrand(id);
    if (count > 0) throw conflictException(`تعداد ${count} عدد محصول با این برند وجود دارد`);

    try {
      const brand = await this.brandModel.findByIdAndDelete(id)
      await this.imageService.deleteImage(brand.imageKey)
    } catch (error) {
      throw requestTimeoutException('مشکلی در پاک کردن برند پیش آمده است')
    }
  }

  async updateOne(id: Types.ObjectId, updateBrandDto: UpdateBrandDto) {

    //* delete the temporary images
    if (updateBrandDto.imageKey)
      await this.temporaryImagesService.deleteTemporaryImagesByNames([updateBrandDto.imageKey])

    try {
      const existingBrand = await this.brandModel.findByIdAndUpdate(id, updateBrandDto, { new: true })
      if (!existingBrand)
        throw notFoundException();
      return existingBrand
    } catch (error) {
      if (error instanceof NotFoundException)
        throw notFoundException('آیدی برند یافت نشد');

      if (error?.code === 11000 && ['nameFA', 'nameEN'].includes(Object.keys(error?.keyPattern)[0]))
        throw badRequestException('برندی با همین نام موجود است');

      throw requestTimeoutException('مشکلی در آپدیت کردن برند رخ داده است')
    }
  }
}