import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { badRequestException, notFoundException, requestTimeoutException, unauthorizedException } from 'src/common/errors';
import { FindAllDto } from 'src/common/findAll.dto';
import { FindOneDto } from 'src/common/findOne.dto';
import { Comment } from './comment.schema';
import { UsersProvider } from 'src/users/users.provider';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { ProductProvider } from 'src/product/product.provider';

@Injectable()
export class CommentService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Comment Model */
    @InjectModel(Comment.name)
    private readonly commentModel: Model<Comment>,

    /**  Inject the product service */
    private readonly productProvider: ProductProvider,

    /**  Inject the users provider */
    private readonly usersProvider: UsersProvider,
  ) { }

  async create(createCommentDto: CreateCommentDto, userInfo: CurrentUserData) {
    const product = await this.productProvider.findOne({ id: createCommentDto.productId })
    if (!product)
      throw notFoundException('محصول مورد نظر یافت نشد')

    const user = await this.usersProvider.findOneByID(userInfo.userId)
    if (!user)
      throw unauthorizedException('شما احراز هویت نشده اید')

    try {
      await (new this.commentModel({ ...createCommentDto, userId: userInfo.userId })).save()
    } catch (error) {
      throw requestTimeoutException('مشکلی در ایجاد کامنت رخ داده است')
    }
  }

  async findAll(limit: number, page: number): Promise<FindAllDto<Comment>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.commentModel.find().skip(skip).limit(limit)

      const [comments, count] = await Promise.all([
        query.lean().exec() as unknown as Comment[],
        this.commentModel.countDocuments()
      ]);

      return {
        count,
        items: comments
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن کامنتها رخ داده است')
    }
  }

  async findOne(findOneDto: FindOneDto): Promise<Comment> {
    try {
      return await this.commentModel.findById(findOneDto.id).populate({ path: 'userId', select: 'name' }).lean().exec();
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی کامنت مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن کامنت رخ داده است')
    }
  }

  async remove(id: string) {
    try {
      const deletedComment = await this.commentModel.findByIdAndDelete(id, { new: true });

      if (!deletedComment)
        throw new NotFoundException()

      // Also delete the children comments
      if (deletedComment.validated) {
        await this.commentModel.deleteMany({ parentCommentId: id });
      }

      return id

    } catch (error) {
      if (error instanceof NotFoundException || error?.name == 'TypeError' || error?.name == 'CastError')
        throw notFoundException('آیدی کامنت مورد نظر یافت نشد')
      throw requestTimeoutException('مشکلی در پاک کردن کامنت رخ داده است')
    }
  }

  async toggleValidation(id: string) {
    try {
      const comment = await this.commentModel.findById(id).populate({ path: 'userId', select: 'name' }).exec();
      if (!comment)
        throw new NotFoundException()

      comment.validated = !comment.validated
      await comment.save()
      return comment
    } catch (error) {
      if (error instanceof NotFoundException || error?.name == 'TypeError' || error?.name == 'CastError')
        throw notFoundException('آیدی کامنت مورد نظر یافت نشد')
      throw requestTimeoutException('مشکلی در گرفتن کامنت رخ داده است')
    }
  }

  /**
   * this function works for both disLike and like toggle
   * @param id string
   * @param userInfo CurrentUserData
   * @param key keyof Comment (if you wanna use like, it should be likeIds)
   * @param otherKey keyof Comment (if you wanna use like, it should be disLikeIds)
   * @returns Comment
   */
  async toggleLikeOrDisLike(id: string, userInfo: CurrentUserData, key: keyof Comment, otherKey: keyof Comment) {
    //the comments below, assume that you wanna use this function for liking
    try {
      const userId = new mongoose.Types.ObjectId(userInfo.userId)
      let comment = await this.commentModel.findById(id).exec();
      if (!comment)
        throw new NotFoundException()

      const userIndex = comment[key].findIndex((otherUserId: mongoose.Types.ObjectId) => otherUserId.equals(userId))

      // Check if userId is already in the likes array
      if (userIndex > -1) {
        comment[key].splice(userIndex, 1);
      } else {
        // User didn't like the comment, add to likes array
        comment[key].push(userId);

        //if user used to dislike the comment, remove it
        const userIndexDis = comment[otherKey].findIndex((item: mongoose.Types.ObjectId) => item.equals(userId))

        if (userIndexDis > -1) {
          comment[otherKey].splice(userIndexDis, 1);
        }
      }

      await comment.save()
      return comment
    } catch (error) {
      if (error instanceof NotFoundException || error?.name == 'TypeError' || error?.name == 'CastError')
        throw notFoundException('آیدی کامنت مورد نظر یافت نشد')
      throw requestTimeoutException('مشکلی در گرفتن کامنت رخ داده است')
    }
  }
}
