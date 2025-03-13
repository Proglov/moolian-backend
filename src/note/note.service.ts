import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Note } from './note.schema';
import { Model } from 'mongoose';
import { badRequestException, requestTimeoutException } from 'src/common/errors';
import { ImageService } from 'src/image/image.service';
import { FindAllDto } from 'src/common/findAll.dto';
import { FindOneDto } from 'src/common/findOne.dto';

@Injectable()
export class NoteService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Note Model */
    @InjectModel(Note.name)
    private readonly noteModel: Model<Note>,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

  ) { }

  async create(createNoteDto: CreateNoteDto, replaceTheImageKey?: boolean): Promise<Note> {
    try {
      const newNote = new this.noteModel(createNoteDto)
      const note = (await newNote.save()).toObject()
      if (!replaceTheImageKey)
        return note
      return (await this.imageService.replaceTheImageKey([note]))[0]
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

      let notes: Note[] = await query.lean().exec();
      let count = notes.length;

      if (!replaceTheImageKey)
        return { items: notes, count }

      notes = await this.imageService.replaceTheImageKey(notes)

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

      return (await this.imageService.replaceTheImageKey([note]))[0]
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی نوت مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن نوت رخ داده است')
    }
  }

}
