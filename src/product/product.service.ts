import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { badRequestException, notFoundException, requestTimeoutException } from 'src/common/errors';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model, Types } from 'mongoose';
import { ImageService } from 'src/image/image.service';
import { Notes, OrderBy } from './enums/product.enums';
import { FindAllDto } from 'src/common/findAll.dto';
import { PopulatedProduct } from './dto/populated-product.type';
import { FindOneDto } from 'src/common/findOne.dto';
import { TemporaryImagesService } from 'src/temporary-images/temporary-images.service';
import { ProductProvider } from './product.provider';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class ProductService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Product Model */
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,

    /**  Inject the product provider */
    private readonly productProvider: ProductProvider,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

    /**  Inject the Temporary images service to delete temp images after product has been created */
    private readonly temporaryImagesService: TemporaryImagesService,

  ) { }

  async create(createProductDto: CreateProductDto, replaceTheImageKey?: boolean) {

    const brand = await this.productProvider.checkTheBrand(createProductDto.brandId);

    // organize the notes based on their types
    const notes = await this.productProvider.checkTheNotes(createProductDto.baseNoteObjects, createProductDto.midNoteObjects, createProductDto.initialNoteObjects)

    try {
      const newProduct = await new this.productModel(createProductDto).save();
      const result = {
        ...newProduct.toObject(),
        brandId: brand,
        initialNoteObjects: notes[Notes.initialNote],
        baseNoteObjects: notes[Notes.baseNote],
        midNoteObjects: notes[Notes.midNote],
      };

      if (!replaceTheImageKey) return result;

      //* delete the temporary images
      await this.temporaryImagesService.deleteTemporaryImagesByNames(result.imageKeys)

      const imageKeys = this.imageService.getImages(result.imageKeys);
      return { ...result, imageKeys: imageKeys.map(imageObj => imageObj.url) };

    } catch (error) {
      if (error?.code === 11000 && ['nameFA', 'nameEN'].includes(Object.keys(error?.keyPattern)[0]))
        throw badRequestException('محصولی با همین نام موجود است');

      throw requestTimeoutException('مشکلی در ایجاد محصول رخ داده است');
    }
  }

  async findAll(query: GetProductsDto, replaceTheImageKey?: boolean): Promise<FindAllDto<PopulatedProduct>> {
    try {
      const skip = (query.page - 1) * query.limit;
      const match: any = {}, sort: any = {};
      const search = query.search?.trim();

      if (query.onlyAvailable) match.availability = true;
      if (query.category) match.category = query.category;
      if (query.flavor) match.flavor = query.flavor;
      if (query.gender) match.gender = query.gender;
      if (query.season) match.season = query.season;
      if (query.brandId) match.brandId = new Types.ObjectId(query.brandId);
      switch (query.orderBy) {
        case OrderBy.cheap:
          sort.price = 1;
          sort._id = 1;
          break;
        case OrderBy.expensive:
          sort.price = -1;
          sort._id = 1;
          break;
        case OrderBy.New:
          sort._id = -1;
          break;
        default:
          sort._id = 1;
          break;
      }
      if (search) {
        const regex = new RegExp(search, 'i');

        match.$or = [
          { nameFA: regex },
          { nameEN: regex },
          { desc: regex },
          { maker: regex },
          { country: regex },
          { olfactory: regex },
        ];
      }

      let result = await this.productModel.aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            items: [
              { $skip: skip },
              { $limit: query.limit },
              ...this.productProvider.getFestivalLookupStages(),
              ...this.productProvider.getBrandLookupStages(),
              ...this.productProvider.getNotesLookupAndAddFieldsStages(),
              {
                $project: {
                  nameFA: 1,
                  nameEN: 1,
                  brandId: 1,
                  desc: 1,
                  imageKeys: 1,
                  price: 1,
                  gender: 1,
                  flavor: 1,
                  category: 1,
                  year: 1,
                  season: 1,
                  maker: 1,
                  country: 1,
                  initialNoteObjects: 1,
                  midNoteObjects: 1,
                  baseNoteObjects: 1,
                  availability: 1,
                  olfactory: 1,
                  festival: 1,
                }
              }
            ],
            count: [
              { $count: 'total' }
            ]
          }
        }
      ]).exec();

      let products = result[0].items;
      const count = result[0].count[0]?.total || 0;

      if (replaceTheImageKey) {
        products = this.productProvider.replaceTheImageKeysOfProducts(products);
      }

      return {
        count,
        items: products
      };

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصولات ها رخ داده است');
    }
  }

  async findAllByIds(ids: Types.ObjectId[], replaceTheImageKey?: boolean): Promise<Product[]> {
    try {
      let products = await this.productModel.aggregate([
        { $match: { _id: { $in: ids.map(id => new Types.ObjectId(id)) } } },
        ...this.productProvider.getFestivalLookupStages(),
        ...this.productProvider.getBrandLookupStages(),
        {
          $group: {
            _id: '$_id',
            nameFA: { $first: '$nameFA' },
            nameEN: { $first: '$nameEN' },
            flavor: { $first: '$flavor' },
            category: { $first: '$category' },
            season: { $first: '$season' },
            brandId: { $first: '$brandId' },
            imageKeys: { $first: '$imageKeys' },
            price: { $first: '$price' },
            festival: { $first: '$festival' }
          }
        }
      ]).exec();


      if (replaceTheImageKey) {
        products = this.productProvider.replaceTheImageKeysAndBrandImageOfProducts(products);
      }

      return products;

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصولات رخ داده است');
    }
  }

  async findOne(findOneDto: FindOneDto, replaceTheImageKey?: boolean): Promise<any> {
    try {
      const productWithFestival = await this.productModel.aggregate([
        { $match: { _id: new Types.ObjectId(findOneDto.id) } },
        ...this.productProvider.getFestivalLookupStages(),
        ...this.productProvider.getBrandLookupStages(),
        ...this.productProvider.getNotesLookupAndAddFieldsStages(),
        {
          $group: {
            _id: '$_id',
            nameFA: { $first: '$nameFA' },
            nameEN: { $first: '$nameEN' },
            brandId: { $first: '$brandId' },
            desc: { $first: '$desc' },
            imageKeys: { $first: '$imageKeys' },
            price: { $first: '$price' },
            gender: { $first: '$gender' },
            flavor: { $first: '$flavor' },
            category: { $first: '$category' },
            year: { $first: '$year' },
            season: { $first: '$season' },
            maker: { $first: '$maker' },
            country: { $first: '$country' },
            initialNoteObjects: { $first: '$initialNoteObjects' },
            midNoteObjects: { $first: '$midNoteObjects' },
            baseNoteObjects: { $first: '$baseNoteObjects' },
            availability: { $first: '$availability' },
            olfactory: { $first: '$olfactory' },
            festival: { $first: '$festival' }
          }
        }
      ]).exec();


      let product = productWithFestival[0];

      if (replaceTheImageKey) {
        product = (this.productProvider.replaceTheImageKeysOfProducts([product]))[0];
      }

      return product;

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصول رخ داده است');
    }
  }

  async update(id: Types.ObjectId, updateProductDto: UpdateProductDto) {
    if (updateProductDto?.brandId)
      await this.productProvider.checkTheBrand(updateProductDto.brandId)

    await this.productProvider.checkTheNotes(updateProductDto.baseNoteObjects || [], updateProductDto.midNoteObjects || [], updateProductDto.initialNoteObjects || [])


    //* delete the temporary images
    if (updateProductDto.imageKeys?.length > 0)
      await this.temporaryImagesService.deleteTemporaryImagesByNames(updateProductDto.imageKeys)

    try {
      const existingProduct = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true })
      if (!existingProduct)
        throw notFoundException();
      return existingProduct
    } catch (error) {
      if (error instanceof NotFoundException)
        throw notFoundException('آیدی محصول یافت نشد');

      if (error?.code === 11000 && ['nameFA', 'nameEN'].includes(Object.keys(error?.keyPattern)[0]))
        throw badRequestException('محصولی با همین نام موجود است');

      throw requestTimeoutException('مشکلی در آپدیت کردن محصول رخ داده است')
    }
  }
}
