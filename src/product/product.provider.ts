import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { notFoundException, requestTimeoutException } from 'src/common/errors';
import { InjectModel } from '@nestjs/mongoose';
import { NoteWithCent, Product } from './product.schema';
import { Model, Types } from 'mongoose';
import { FindOneDto } from 'src/common/findOne.dto';
import { PopulatedNoteWithCent, PopulatedProduct } from './dto/populated-product.type';
import { ImageService } from 'src/image/image.service';
import { BrandService } from 'src/brand/brand.service';
import { NoteService } from 'src/note/note.service';
import { Brand } from 'src/brand/brand.schema';
import { Note } from 'src/note/note.schema';
import { Notes } from './enums/product.enums';

@Injectable()
export class ProductProvider {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Product Model */
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,

    /**  Inject the brand service */
    @Inject(forwardRef(() => BrandService))
    private readonly brandService: BrandService,

    /**  Inject the note service */
    private readonly noteService: NoteService,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

  ) { }


  noteObjectPopulateHelper(path: string) {
    return {
      path,
      select: 'noteId cent',
      populate: {
        path: 'noteId'
      },
    }
  }

  async checkTheBrand(id: Types.ObjectId): Promise<Brand> {
    const brand = await this.brandService.findOne({ id }, true);
    if (!brand) throw notFoundException('برند مورد نظر یافت نشد');
    return brand
  }

  async checkTheNotes(baseNoteObjects?: NoteWithCent[], midNoteObjects?: NoteWithCent[], initialNoteObjects?: NoteWithCent[]): Promise<Record<Notes, PopulatedNoteWithCent[]>> {
    // Create an array of promises paired with their type of note id
    const notePromises = [
      ...baseNoteObjects.map(baseNoteObject =>
        this.noteService.findOne({ id: baseNoteObject.noteId }, true).then((note: Note) => ({ noteObj: { noteId: note, cent: baseNoteObject.cent }, type: Notes.baseNote }))
      ),
      ...midNoteObjects.map(midNoteObject =>
        this.noteService.findOne({ id: midNoteObject.noteId }, true).then((note: Note) => ({ noteObj: { noteId: note, cent: midNoteObject.cent }, type: Notes.midNote }))
      ),
      ...initialNoteObjects.map(initialNoteObject =>
        this.noteService.findOne({ id: initialNoteObject.noteId }, true).then((note: Note) => ({ noteObj: { noteId: note, cent: initialNoteObject.cent }, type: Notes.initialNote }))
      )
    ];
    const noteObjectsWithTypes = await Promise.all(notePromises);
    if ((baseNoteObjects.length !== 0 || initialNoteObjects.length !== 0 || midNoteObjects.length !== 0) && noteObjectsWithTypes.every(item => !item.noteObj.noteId._id))
      throw notFoundException('نوت مورد نظر یافت نشد');

    // organize the notes based on their types
    const notes = noteObjectsWithTypes.reduce((acc, { noteObj, type }) => {
      acc[type] = [...(acc[type] || []), noteObj];
      return acc;
    }, { [Notes.baseNote]: [], [Notes.initialNote]: [], [Notes.midNote]: [] });

    return notes
  }

  replaceTheImageKeysOfProducts(products: PopulatedProduct[]): PopulatedProduct[] {
    const noteKeys: (keyof PopulatedProduct)[] = ['initialNoteObjects', 'midNoteObjects', 'baseNoteObjects']

    //get the links of notes imageKeys, brand imageKey, and the imageKeys
    const links = this.imageService.getImages(products.map(product => [...noteKeys.map(noteKey => product[noteKey].map((noteObj: PopulatedNoteWithCent) => noteObj.noteId.imageKey)), product.brandId.imageKey, product.imageKeys]).flat(2));

    // Create a map for fast access by filename
    const linkMap = new Map(links.map(link => [link.filename, link.url]));

    // Map the products and replace the imageKey where available
    return products.map(product => {
      //deep clone
      const newObj = JSON.parse(JSON.stringify(product))
      //replace the brandId
      newObj.brandId = { ...product.brandId, imageKey: linkMap.get(product.brandId.imageKey) }
      //replace the imageKeys
      newObj.imageKeys = product.imageKeys.map(imageKey => linkMap.get(imageKey));
      //replace the notes
      noteKeys.map(noteKey => {
        newObj[noteKey] = product[noteKey].map((note: PopulatedNoteWithCent) => ({
          ...note,
          noteId: {
            "_id": note.noteId._id,
            "name": note.noteId.name,
            imageKey: linkMap.get(note.noteId.imageKey)
          }
        }))
      })
      return newObj as PopulatedProduct;
    });
  }

  replaceTheImageKeysAndBrandImageOfProducts(products: PopulatedProduct[]): PopulatedProduct[] {

    //get the links of notes imageKeys, brand imageKey, and the imageKeys
    const links = this.imageService.getImages(products.map(product => [product.brandId.imageKey, product.imageKeys]).flat(2));

    // Create a map for fast access by filename
    const linkMap = new Map(links.map(link => [link.filename, link.url]));

    // Map the products and replace the imageKey where available
    return products.map(product => {
      //deep clone
      const newObj = JSON.parse(JSON.stringify(product))
      //replace the brandId
      newObj.brandId = { ...product.brandId, imageKey: linkMap.get(product.brandId.imageKey) }
      //replace the imageKeys
      newObj.imageKeys = product.imageKeys.map(imageKey => linkMap.get(imageKey));
      return newObj as PopulatedProduct;
    });
  }

  replaceTheImageKeysOnlyOfProducts(products: Product[]): Product[] {
    //get the links of the imageKeys
    const links = this.imageService.getImages(products.map(product => product.imageKeys).flat());

    // Create a map for fast access by filename
    const linkMap = new Map(links.map(link => [link.filename, link.url]));

    // Map the products and replace the imageKey where available
    return products.map(product => {
      //deep clone
      const newObj = JSON.parse(JSON.stringify(product))
      //replace the imageKeys
      newObj.imageKeys = product.imageKeys.map(imageKey => linkMap.get(imageKey));
      return newObj as Product;
    });
  }

  /** festival population helper function */
  getFestivalLookupStages() {
    return [
      {
        $lookup: {
          from: 'festivals',
          localField: '_id',
          foreignField: 'productId',
          as: 'festival'
        }
      },
      {
        $unwind: {
          path: '$festival',
          preserveNullAndEmptyArrays: true
        }
      }
    ];
  }

  /** brand population helper function */
  getBrandLookupStages() {
    return [
      {
        $lookup: {
          from: 'brands',
          localField: 'brandId',
          foreignField: '_id',
          as: 'brandId'
        }
      },
      {
        $unwind: {
          path: '$brandId',
          preserveNullAndEmptyArrays: true
        }
      }
    ];
  }

  /** notes population helper function */
  getNotesLookupAndAddFieldsStages() {
    return [
      {
        $lookup: {
          from: 'notes',
          localField: 'initialNoteObjects.noteId',
          foreignField: '_id',
          as: 'initialNotes'
        }
      },
      {
        $lookup: {
          from: 'notes',
          localField: 'midNoteObjects.noteId',
          foreignField: '_id',
          as: 'midNotes'
        }
      },
      {
        $lookup: {
          from: 'notes',
          localField: 'baseNoteObjects.noteId',
          foreignField: '_id',
          as: 'baseNotes'
        }
      },
      {
        $addFields: {
          initialNoteObjects: {
            $map: {
              input: '$initialNoteObjects',
              as: 'inputNote',
              in: {
                $mergeObjects: [
                  { noteId: { $arrayElemAt: ['$initialNotes', { $indexOfArray: ['$initialNotes._id', '$$inputNote.noteId'] }] } },
                  { cent: '$$inputNote.cent' }
                ]
              }
            }
          },
          midNoteObjects: {
            $map: {
              input: '$midNoteObjects',
              as: 'inputNote',
              in: {
                $mergeObjects: [
                  { noteId: { $arrayElemAt: ['$midNotes', { $indexOfArray: ['$midNotes._id', '$$inputNote.noteId'] }] } },
                  { cent: '$$inputNote.cent' }
                ]
              }
            }
          },
          baseNoteObjects: {
            $map: {
              input: '$baseNoteObjects',
              as: 'inputNote',
              in: {
                $mergeObjects: [
                  { noteId: { $arrayElemAt: ['$baseNotes', { $indexOfArray: ['$baseNotes._id', '$$inputNote.noteId'] }] } },
                  { cent: '$$inputNote.cent' }
                ]
              }
            }
          }
        }
      }
    ];
  }

  async findOne(findOneDto: FindOneDto): Promise<Product> {
    try {
      return await this.productModel.findById(findOneDto.id).lean().exec() as unknown as Product
    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصول رخ داده است')
    }
  }

  async findMany(ids: Types.ObjectId[]): Promise<Product[]> {
    try {
      return await this.productModel.find({ _id: { $in: ids } }).lean().exec() as unknown as Product[]
    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصولات رخ داده است')
    }
  }

  async findManyWithFestivals(ids: Types.ObjectId[]): Promise<PopulatedProduct[]> {
    try {
      const newIds = ids.map(id => new Types.ObjectId(id))
      return await this.productModel.aggregate([
        { $match: { _id: { $in: newIds } } },
        {
          $lookup: {
            from: 'festivals',
            localField: '_id',
            foreignField: 'productId',
            as: 'festival'
          }
        },
        {
          $unwind: {
            path: '$festival',
            preserveNullAndEmptyArrays: true
          }
        },
      ])
    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصولات رخ داده است')
    }
  }

  async countProductsOfABrand(brandId: Types.ObjectId): Promise<number> {
    try {
      return await this.productModel.countDocuments({ brandId });
    } catch (error) {
      throw requestTimeoutException('مشکلی در شمردن محصولات برند رخ داده است')
    }
  }

  async countProductsOfANote(noteId: Types.ObjectId): Promise<number> {
    try {
      return await this.productModel.countDocuments({
        $or: [
          { 'initialNoteObjects.noteId': noteId },
          { 'midNoteObjects.noteId': noteId },
          { 'baseNoteObjects.noteId': noteId }
        ]
      });
    } catch (error) {
      throw requestTimeoutException('مشکلی در شمردن محصولات نوت رخ داده است')
    }
  }
}
