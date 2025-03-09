import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { Model } from 'mongoose';
import { badRequestException, requestTimeoutException } from 'src/common/errors';
import { ImageService } from 'src/image/image.service';
import { FindOneCategoryParamDto } from './dto/findOneCategory.dto';
import { FindAllDto } from 'src/common/findAll.dto';

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

  // this function get the links at first, and then connects to the  related category
  async replaceTheImageKey(categories: Category[]): Promise<Category[]> {
    const links = await this.imageService.getImages(categories.map(category => category.imageKey))
    return categories.map(currentCategory => {
      for (let i = 0; i < links.length; i++) {
        if (links[i].filename === currentCategory.imageKey)
          return {
            ...currentCategory,
            imageKey: links[i].url
          } as Category;
      }
      return currentCategory;
    })
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const newCategory = new this.categoryModel(createCategoryDto)
      const category = (await newCategory.save()).toObject()
      return (await this.replaceTheImageKey([category]))[0]
    } catch (error) {
      //* mongoose duplication error
      if (error?.code === 11000 && Object.keys(error?.keyPattern)[0] === 'name')
        throw badRequestException('دسته بندی ای با همین نام موجود است')

      throw requestTimeoutException('مشکلی در ایجاد دسته بتدی رخ داده است')
    }
  }

  async findAll(limit: number, page: number): Promise<FindAllDto<Category>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.categoryModel.find().skip(skip).limit(limit)

      let categories: Category[] = await query.lean().exec();
      let count = categories.length;

      categories = await this.replaceTheImageKey(categories)

      return {
        count,
        items: categories
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن دسته بتدی ها رخ داده است')
    }
  }

  async findOne(findOneCategoryParamDto: FindOneCategoryParamDto): Promise<Category> {
    try {
      const category = await this.categoryModel.findById(findOneCategoryParamDto.id).lean().exec();
      return (await this.replaceTheImageKey([category]))[0]
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی دسته بندی مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن دسته بتدی رخ داده است')
    }
  }

}
