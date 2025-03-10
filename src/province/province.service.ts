import { Injectable } from '@nestjs/common';
import { CreateProvinceDto } from './dto/create-province.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Province } from './province.schema';
import { Model } from 'mongoose';
import { badRequestException, requestTimeoutException } from 'src/common/errors';
import { FindAllDto } from 'src/common/findAll.dto';
import { FindOneDto } from 'src/common/findOne.dto';

@Injectable()
export class ProvinceService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Province Model */
    @InjectModel(Province.name)
    private readonly provinceModel: Model<Province>,

  ) { }

  async create(createProvinceDto: CreateProvinceDto): Promise<Province> {
    try {
      const newProvince = new this.provinceModel(createProvinceDto)
      return (await newProvince.save()).toObject()
    } catch (error) {
      //* mongoose duplication error
      if (error?.code === 11000 && Object.keys(error?.keyPattern)[0] === 'name')
        throw badRequestException('استانی با همین نام موجود است')

      throw requestTimeoutException('مشکلی در ایجاد استان رخ داده است')
    }
  }

  async findAll(limit: number, page: number): Promise<FindAllDto<Province>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.provinceModel.find().skip(skip).limit(limit)

      const categories: Province[] = await query.lean().exec();
      let count = categories.length;

      return {
        count,
        items: categories
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن استان ها رخ داده است')
    }
  }

  async findOne(findOneDto: FindOneDto): Promise<Province> {
    try {
      return await this.provinceModel.findById(findOneDto.id).lean().exec();
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی استان مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن استان رخ داده است')
    }
  }

}
