import { Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { InjectModel } from '@nestjs/mongoose';
import { City } from './city.schema';
import { Model } from 'mongoose';
import { ProvinceService } from 'src/province/province.service';
import { badRequestException, notFoundException, requestTimeoutException } from 'src/common/errors';
import { FindOneDto } from 'src/common/findOne.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { CookieProvider } from 'src/cookie/cookie.provider';
import { citiesIds_Cookie_Name } from 'src/common/constants';
import { Request, Response } from 'express';
import { CitiesIdsDto } from './dto/set-cities-Ids.dto';

@Injectable()
export class CityService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the City Model */
    @InjectModel(City.name)
    private readonly cityModel: Model<City>,

    /**  Inject the province service */
    private readonly provinceService: ProvinceService,

    /**  Inject the cookie provider */
    private readonly cookieProvider: CookieProvider
  ) { }

  async create(createCityDto: CreateCityDto) {

    const province = await this.provinceService.findOne({ id: createCityDto.provinceId })

    if (!province)
      throw notFoundException('استان مورد نظر یافت نشد')

    try {
      const newCity = new this.cityModel({
        name: createCityDto.name,
        provinceId: createCityDto.provinceId
      })

      await newCity.save();
      return { name: newCity.name, _id: newCity._id, provinceId: { name: province.name } }
    } catch (error) {
      //* mongoose duplication error
      if (error?.code === 11000 && Object.keys(error?.keyPattern)[0] === 'name')
        throw badRequestException('شهری با همین نام موجود است')

      throw requestTimeoutException('مشکلی در ایجاد شهر رخ داده است')
    }
  }

  async findAll(limit: number, page: number): Promise<FindAllDto<City>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.cityModel.find().skip(skip).limit(limit)

      const [cities, count] = await Promise.all([
        query.lean().exec() as unknown as City[],
        this.cityModel.countDocuments()
      ]);

      return {
        count,
        items: cities
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن شهرها رخ داده است')
    }
  }

  async setCitiesIds(response: Response, citiesIdsDto: CitiesIdsDto): Promise<any> {
    try {
      this.cookieProvider.addCookie(response, citiesIds_Cookie_Name, JSON.stringify(citiesIdsDto.ids), 86400)
    } catch (error) {
      throw requestTimeoutException('مشکلی در ست کردن کوکی شهرها رخ داده است')
    }
  }

  async getAllCitiesForHomePage(req: Request): Promise<any> {
    try {
      const citiesIds = req.cookies[citiesIds_Cookie_Name];
      const preSelectedCities = !!citiesIds ? JSON.parse(citiesIds) : []

      const query = this.cityModel.find().populate({ path: "provinceId", select: 'name' })
      const cities = await query.lean().exec();

      return {
        cities,
        preSelectedCities
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن شهرها رخ داده است')
    }
  }

  async findOne(findOneDto: FindOneDto): Promise<City> {
    try {
      return await this.cityModel.findById(findOneDto.id).populate({ path: "provinceId", select: 'name' }).lean().exec();
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی شهر مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن شهر رخ داده است')
    }
  }
}
