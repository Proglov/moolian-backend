import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Note } from './note.schema';
import { Model, Types } from 'mongoose';
import { badRequestException, conflictException, notFoundException, requestTimeoutException } from 'src/common/errors';
import { ImageService } from 'src/image/image.service';
import { FindAllDto } from 'src/common/findAll.dto';
import { FindOneDto } from 'src/common/findOne.dto';
import { TemporaryImagesService } from 'src/temporary-images/temporary-images.service';
import { ProductProvider } from 'src/product/product.provider';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NoteService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Note Model */
    @InjectModel(Note.name)
    private readonly noteModel: Model<Note>,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

    /**  Inject the Temporary images service to delete temp images after product has been created */
    private readonly temporaryImagesService: TemporaryImagesService,

    /**  Inject the product provider to count the products of a brand*/
    @Inject(forwardRef(() => ProductProvider))
    private readonly productProvider: ProductProvider
  ) { }

  async create(createNoteDto: CreateNoteDto, replaceTheImageKey?: boolean): Promise<Note> {
    try {
      const newNote = new this.noteModel(createNoteDto)
      const note = (await newNote.save()).toObject()
      if (!replaceTheImageKey)
        return note

      //* delete the temporary image
      await this.temporaryImagesService.deleteTemporaryImagesByNames([createNoteDto.imageKey])

      return (this.imageService.replaceTheImageKey([note]))[0]
    } catch (error) {
      //* mongoose duplication error
      if (error?.code === 11000 && Object.keys(error?.keyPattern)[0] === 'name')
        throw badRequestException('نوتی با همین نام موجود است')

      throw requestTimeoutException('مشکلی در ایجاد نوت رخ داده است')
    }
  }

  async findAll(limit: number, page: number, replaceTheImageKey?: boolean): Promise<FindAllDto<Note>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.noteModel.find().skip(skip).limit(limit)

      let [notes, count] = await Promise.all([
        query.lean().exec() as unknown as Note[],
        this.noteModel.countDocuments()
      ]);

      if (!replaceTheImageKey)
        return { items: notes, count }

      notes = this.imageService.replaceTheImageKey(notes)

      return {
        count,
        items: notes
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن نوت ها رخ داده است')
    }
  }

  async findOne(findOneDto: FindOneDto, replaceTheImageKey?: boolean): Promise<Note> {
    try {
      const note = await this.noteModel.findById(findOneDto.id).lean().exec();

      if (!replaceTheImageKey)
        return note

      return (this.imageService.replaceTheImageKey([note]))[0]
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی نوت مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن نوت رخ داده است')
    }
  }

  async deleteOne(id: Types.ObjectId) {
    const count = await this.productProvider.countProductsOfANote(id);
    if (count > 0) throw conflictException(`تعداد ${count} عدد محصول با این نوت وجود دارد`);

    try {
      const note = await this.noteModel.findByIdAndDelete(id)
      await this.imageService.deleteImage(note.imageKey)
    } catch (error) {
      throw requestTimeoutException('مشکلی در پاک کردن نوت پیش آمده است')
    }
  }

  async updateOne(id: Types.ObjectId, updateNoteDto: UpdateNoteDto) {

    //* delete the temporary images
    if (updateNoteDto.imageKey)
      await this.temporaryImagesService.deleteTemporaryImagesByNames([updateNoteDto.imageKey])

    try {
      const existingNote = await this.noteModel.findByIdAndUpdate(id, updateNoteDto, { new: true })
      if (!existingNote)
        throw notFoundException();
      return existingNote
    } catch (error) {
      if (error instanceof NotFoundException)
        throw notFoundException('آیدی نوت یافت نشد');

      if (error?.code === 11000 && ['name'].includes(Object.keys(error?.keyPattern)[0]))
        throw badRequestException('نوتی با همین نام موجود است');

      throw requestTimeoutException('مشکلی در آپدیت کردن نوت رخ داده است')
    }
  }
}
