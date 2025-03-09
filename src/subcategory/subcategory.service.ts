import { Injectable } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subcategory } from './subcategory.schema';
import { Model } from 'mongoose';
import { CategoryService } from 'src/category/category.service';
import { badRequestException, notFoundException, requestTimeoutException } from 'src/common/errors';
import { FindOneDto } from 'src/common/findOne.dto';
import { FindAllDto } from 'src/common/findAll.dto';

@Injectable()
export class SubcategoryService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Subcategory Model */
    @InjectModel(Subcategory.name)
    private readonly subcategoryModel: Model<Subcategory>,

    /**  Inject the category service to replace the category link */
    private readonly categoryService: CategoryService,

  ) { }

  async create(createSubcategoryDto: CreateSubcategoryDto) {

    const category = await this.categoryService.findOne({ id: createSubcategoryDto.categoryId })

    if (!category)
      throw notFoundException('دسته بندی مورد نظر یافت نشد')

    try {
      const newSubcategory = new this.subcategoryModel({
        name: createSubcategoryDto.name,
        categoryId: createSubcategoryDto.categoryId
      })

      await newSubcategory.save();
      return { name: newSubcategory.name, _id: newSubcategory._id, categoryId: { name: category.name } }
    } catch (error) {
      //* mongoose duplication error
      if (error?.code === 11000 && Object.keys(error?.keyPattern)[0] === 'name')
        throw badRequestException('زیر دسته بندی ای با همین نام موجود است')

      throw requestTimeoutException('مشکلی در ایجاد زیر دسته بتدی رخ داده است')
    }
  }

  async findAll(limit: number, page: number): Promise<FindAllDto<Subcategory>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.subcategoryModel.find().skip(skip).limit(limit)

      const subcategories: Subcategory[] = await query.lean().exec();
      let count = subcategories.length;

      return {
        count,
        items: subcategories
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن دسته بتدی ها رخ داده است')
    }
  }

  async findOne(findOneDto: FindOneDto): Promise<Subcategory> {
    try {
      const subcategory = await this.subcategoryModel.findById(findOneDto.id).populate({ path: "categoryId", select: 'name' }).lean().exec();
      return subcategory
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی دسته بندی مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن دسته بتدی رخ داده است')
    }
  }
}
