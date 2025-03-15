import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { Model } from 'mongoose';
import { badRequestException, requestTimeoutException } from 'src/common/errors';
import { ImageService } from 'src/image/image.service';
import { FindAllDto } from 'src/common/findAll.dto';
import { FindOneDto } from 'src/common/findOne.dto';

@Injectable()
export class CategoryService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Category Model */
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

  ) { }

  async create(createCategoryDto: CreateCategoryDto, replaceTheImageKey?: boolean): Promise<Category> {
    try {
      const newCategory = new this.categoryModel(createCategoryDto)
      const category = (await newCategory.save()).toObject()
      if (!replaceTheImageKey)
        return category
      return (await this.imageService.replaceTheImageKey([category]))[0]
    } catch (error) {
      //* mongoose duplication error
      if (error?.code === 11000 && Object.keys(error?.keyPattern)[0] === 'name')
        throw badRequestException('دسته بندی ای با همین نام موجود است')

      throw requestTimeoutException('مشکلی در ایجاد دسته بندی رخ داده است')
    }
  }

  async findAll(limit: number, page: number, replaceTheImageKey?: boolean): Promise<FindAllDto<Category>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.categoryModel.find().skip(skip).limit(limit)

      let [categories, count] = await Promise.all([
        query.lean().exec() as unknown as Category[],
        this.categoryModel.countDocuments()
      ]);

      if (replaceTheImageKey)
        categories = await this.imageService.replaceTheImageKey(categories)

      return {
        count,
        items: categories
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن دسته بندی ها رخ داده است')
    }
  }

  async findOne(findOneDto: FindOneDto, replaceTheImageKey?: boolean): Promise<Category> {
    try {
      const category = await this.categoryModel.findById(findOneDto.id).lean().exec();
      if (!replaceTheImageKey)
        return category
      return (await this.imageService.replaceTheImageKey([category]))[0]
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی دسته بندی مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن دسته بندی رخ داده است')
    }
  }

}
