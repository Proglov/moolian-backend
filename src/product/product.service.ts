import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { badRequestException, notFoundException, requestTimeoutException } from 'src/common/errors';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model } from 'mongoose';
import { BrandService } from 'src/brand/brand.service';
import { NoteService } from 'src/note/note.service';
import { ImageService } from 'src/image/image.service';
import { Notes } from './enums/product.enums';
import { FindAllDto } from 'src/common/findAll.dto';
import { PopulatedProduct } from './dto/populated-product.type';
import { Note } from 'src/note/note.schema';
import { FindOneDto } from 'src/common/findOne.dto';
import { Brand } from 'src/brand/brand.schema';
import { TemporaryImagesService } from 'src/temporary-images/temporary-images.service';

@Injectable()
export class ProductService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Product Model */
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,

    /**  Inject the brand service */
    private readonly brandService: BrandService,

    /**  Inject the note service */
    private readonly noteService: NoteService,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

    /**  Inject the Temporary images service to delete temp images after product has been created */
    private readonly temporaryImagesService: TemporaryImagesService,

  ) { }

  private async replaceTheImageKeysOfProducts(products: PopulatedProduct[]): Promise<PopulatedProduct[]> {
    const noteKeys: (keyof PopulatedProduct)[] = ['initialNoteIds', 'midNoteIds', 'baseNoteIds']

    //get the links of notes imageKeys, brand imageKey, and the imageKeys
    const links = await this.imageService.getImages(products.map(product => [...noteKeys.map(noteKey => product[noteKey].map((note: Note) => note.imageKey)), product.brandId.imageKey, product.imageKeys]).flat(2));

    // Create a map for fast access by filename
    const linkMap = new Map(links.map(link => [link.filename, link.url]));

    // Map the products and replace the imageKey where available
    return products.map(currentProduct => {
      //deep clone
      const newObj = JSON.parse(JSON.stringify(currentProduct))
      //replace the brandId
      newObj.brandId = { ...currentProduct.brandId, imageKey: linkMap.get(currentProduct.brandId.imageKey) }
      //replace the imageKeys
      newObj.imageKeys = currentProduct.imageKeys.map(imageKey => linkMap.get(imageKey));
      //replace the notes
      noteKeys.map(noteKey => {
        newObj[noteKey] = currentProduct[noteKey].map((note: Note) => ({ ...note, imageKey: linkMap.get(note.imageKey) }))
      })
      return newObj as PopulatedProduct;
    });
  }

  async checkTheBrand(id: string): Promise<Brand> {
    const brand = await this.brandService.findOne({ id }, true);
    if (!brand) throw notFoundException('برند مورد نظر یافت نشد');
    return brand
  }

  async checkTheNotes(baseNoteIds?: string[], midNoteIds?: string[], initialNoteIds?: string[]): Promise<Record<Notes, Note[]>> {
    // Create an array of promises paired with their type of note id
    const notePromises = [
      ...baseNoteIds.map(baseNoteId =>
        this.noteService.findOne({ id: baseNoteId }, true).then(note => ({ note, type: Notes.baseNote }))
      ),
      ...midNoteIds.map(midNoteId =>
        this.noteService.findOne({ id: midNoteId }, true).then(note => ({ note, type: Notes.midNote }))
      ),
      ...initialNoteIds.map(initialNoteId =>
        this.noteService.findOne({ id: initialNoteId }, true).then(note => ({ note, type: Notes.initialNote }))
      )
    ];
    const notesWithTypes = await Promise.all(notePromises);
    if ((baseNoteIds.length !== 0 || initialNoteIds.length !== 0 || midNoteIds.length !== 0) && notesWithTypes.every(item => !item.note))
      throw notFoundException('نوت مورد نظر یافت نشد');

    // organize the notes based on their types
    const notes = notesWithTypes.reduce((acc, { note, type }) => {
      acc[type] = [...(acc[type] || []), note];
      return acc;
    }, { [Notes.baseNote]: [], [Notes.initialNote]: [], [Notes.midNote]: [] });

    return notes
  }

  async create(createProductDto: CreateProductDto, replaceTheImageKey?: boolean) {

    const brand = await this.checkTheBrand(createProductDto.brandId);

    // organize the notes based on their types
    const notes = await this.checkTheNotes(createProductDto.baseNoteIds, createProductDto.midNoteIds, createProductDto.initialNoteIds)

    try {
      const newProduct = await new this.productModel(createProductDto).save();
      const result = {
        ...newProduct.toObject(),
        brandId: brand,
        initialNoteIds: notes[Notes.initialNote],
        baseNoteIds: notes[Notes.baseNote],
        midNoteIds: notes[Notes.midNote],
      };

      if (!replaceTheImageKey) return result;

      //* delete the temporary images
      await this.temporaryImagesService.deleteTemporaryImagesByNames(result.imageKeys)

      const imageKeys = await this.imageService.getImages(result.imageKeys);
      return { ...result, imageKeys: imageKeys.map(imageObj => imageObj.url) };

    } catch (error) {
      if (error?.code === 11000 && ['nameFA', 'nameEN'].includes(Object.keys(error?.keyPattern)[0]))
        throw badRequestException('محصولی با همین نام موجود است');

      throw requestTimeoutException('مشکلی در ایجاد محصول رخ داده است');
    }
  }

  async findAll(limit: number, page: number, replaceTheImageKey?: boolean): Promise<FindAllDto<PopulatedProduct>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.productModel.find()
        .populate('brandId')
        .populate('initialNoteIds')
        .populate('midNoteIds')
        .populate('baseNoteIds')
        .skip(skip).limit(limit)

      let products = await query.lean().exec() as unknown as PopulatedProduct[];
      let count = products.length;

      if (replaceTheImageKey)
        products = await this.replaceTheImageKeysOfProducts(products)

      return {
        count,
        items: products
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصولات ها رخ داده است')
    }
  }

  //! THIS METHOD IS NOT COMPLETED YET. WE NEED TO ADD DISCOUNTS TO THE AGGREGATION
  async findOne(findOneDto: FindOneDto, replaceTheImageKey?: boolean): Promise<Product> {
    throw new ServiceUnavailableException('this method is not completed yet')
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (updateProductDto?.brandId)
      await this.checkTheBrand(updateProductDto.brandId)

    await this.checkTheNotes(updateProductDto.baseNoteIds, updateProductDto.midNoteIds, updateProductDto.initialNoteIds)


    //* delete the temporary images
    if (updateProductDto.imageKeys.length > 0)
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
