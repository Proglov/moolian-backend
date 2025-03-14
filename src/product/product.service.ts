import { Injectable } from '@nestjs/common';
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

  ) { }

  private async replaceTheImageKeys(products: Product[]): Promise<Product[]> {
    const links = await this.imageService.getImages(products.map(product => product.imageKeys).flat());

    // Create a map for fast access by filename
    const linkMap = new Map(links.map(link => [link.filename, link.url]));

    // Map the products and replace the imageKey where available
    return products.map(currentProduct => {
      let imageKeys = currentProduct.imageKeys.map(imageKey => linkMap.get(imageKey));
      return {
        ...currentProduct,
        imageKeys: imageKeys
      } as Product;
    });
  }

  async create(createProductDto: CreateProductDto, replaceTheImageKey?: boolean) {

    const brand = await this.brandService.findOne({ id: createProductDto.brandId }, true);
    if (!brand) throw notFoundException('برند مورد نظر یافت نشد');

    // Create an array of promises paired with their type of note id
    const notePromises = [
      ...createProductDto.baseNoteIds.map(baseNoteId =>
        this.noteService.findOne({ id: baseNoteId }, true).then(note => ({ note, type: Notes.baseNote }))
      ),
      ...createProductDto.midNoteIds.map(midNoteId =>
        this.noteService.findOne({ id: midNoteId }, true).then(note => ({ note, type: Notes.midNote }))
      ),
      ...createProductDto.initialNoteIds.map(initialNoteId =>
        this.noteService.findOne({ id: initialNoteId }, true).then(note => ({ note, type: Notes.initialNote }))
      )
    ];

    const notesWithTypes = await Promise.all(notePromises);
    if (notesWithTypes.some(item => !item.note)) throw notFoundException('نوت مورد نظر یافت نشد');

    // organize the notes based on their types
    const notes = notesWithTypes.reduce((acc, { note, type }) => {
      acc[type] = [...(acc[type] || []), note];
      return acc;
    }, { [Notes.baseNote]: [], [Notes.initialNote]: [], [Notes.midNote]: [] });

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

      const imageKeys = await this.imageService.getImages(result.imageKeys);
      return { ...result, imageKeys: imageKeys.map(imageObj => imageObj.url) };

    } catch (error) {
      if (error?.code === 11000 && ['nameFA', 'nameEN'].includes(Object.keys(error?.keyPattern)[0])) {
        throw badRequestException('محصولی با همین نام موجود است');
      }
      throw requestTimeoutException('مشکلی در ایجاد محصول رخ داده است');
    }
  }

  async findAll(limit: number, page: number, replaceTheImageKey?: boolean): Promise<FindAllDto<Product>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.productModel.find()
        .populate('brandId')
        .populate('initialNoteIds')
        .populate('midNoteIds')
        .populate('baseNoteIds')
        .skip(skip).limit(limit)

      let products: Product[] = await query.lean().exec();
      let count = products.length;

      if (replaceTheImageKey)
        products = await this.replaceTheImageKeys(products)

      return {
        count,
        items: products
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصولات ها رخ داده است')
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }
}
