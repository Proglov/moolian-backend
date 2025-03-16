import { Injectable } from '@nestjs/common';
import { requestTimeoutException } from 'src/common/errors';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model } from 'mongoose';
import { FindOneDto } from 'src/common/findOne.dto';

@Injectable()
export class ProductProvider {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Product Model */
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,

  ) { }

  async findOne(findOneDto: FindOneDto): Promise<Product> {
    try {
      return await this.productModel.findById(findOneDto.id).lean().exec() as unknown as Product
    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصول رخ داده است')
    }
  }
}
