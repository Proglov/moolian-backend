import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { badRequestException, notFoundException, requestTimeoutException } from 'src/common/errors';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from './article.schema';
import { Model } from 'mongoose';
import { ProductProvider } from 'src/product/product.provider';
import { ImageService } from 'src/image/image.service';
import { FindAllDto } from 'src/common/findAll.dto';
import { FindOneDto } from 'src/common/findOne.dto';
import { Types } from 'mongoose';
import { TemporaryImagesService } from 'src/temporary-images/temporary-images.service';

@Injectable()
export class ArticleService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Article Model */
    @InjectModel(Article.name)
    private readonly articleModel: Model<Article>,

    /**  Inject the product provider */
    private readonly productProvider: ProductProvider,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

    /**  Inject the Temporary images service to delete temp images after product has been created */
    private readonly temporaryImagesService: TemporaryImagesService,
  ) { }

  readonly productIdsPopulationObject = { path: "productIds", select: "nameFA" }

  replaceImageKeyOfArticles(articles: Article[]): Article[] {
    //get the link of imageKey
    const links = this.imageService.getImages(articles.map(article => article.imageKey));

    // Create a map for fast access by filename
    const linkMap = new Map(links.map(link => [link.filename, link.url]));

    // Map the articles and replace the imageKey where available
    return articles.map(article => {
      //deep clone
      const newObj = JSON.parse(JSON.stringify(article))
      //replace the imageKey
      newObj.imageKey = linkMap.get(article.imageKey);
      return newObj as Article;
    });
  }

  async create(createArticleDto: CreateArticleDto) {
    const products = await this.productProvider.findMany(createArticleDto.productIds)
    if (products.length !== createArticleDto.productIds.length)
      throw notFoundException('محصول مورد نظر یافت نشد')

    try {
      const newArticle = new this.articleModel(createArticleDto)

      let articleObj = (await newArticle.save()).toObject();
      articleObj = (await this.replaceImageKeyOfArticles([articleObj]))[0] as typeof articleObj;

      return { ...articleObj, productIds: [products.map(p => ({ _id: p._id, nameFA: p.nameFA }))] }
    } catch (error) {
      throw requestTimeoutException('مشکلی در ایجاد مجله رخ داده است')
    }
  }

  async findAll(limit: number, page: number): Promise<FindAllDto<Article>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.articleModel.find().populate(this.productIdsPopulationObject).skip(skip).limit(limit)

      let [articles, count] = await Promise.all([
        query.lean().exec() as unknown as Article[],
        this.articleModel.countDocuments()
      ]);

      articles = await this.replaceImageKeyOfArticles(articles)

      return {
        count,
        items: articles
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن مجلات رخ داده است')
    }
  }

  async findOne(findOneDto: FindOneDto): Promise<Article> {
    try {
      let article = await this.articleModel.findById(findOneDto.id).populate(this.productIdsPopulationObject).lean().exec();
      article = (await this.replaceImageKeyOfArticles([article]))[0] as typeof article;
      return article
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی مجله مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن مجله رخ داده است')
    }
  }

  async update(id: Types.ObjectId, updateArticleDto: UpdateArticleDto) {

    //* delete the temporary image
    if (!!updateArticleDto.imageKey)
      await this.temporaryImagesService.deleteTemporaryImagesByNames([updateArticleDto.imageKey])

    if (Array.isArray(updateArticleDto.productIds) && updateArticleDto.productIds.length > 0) {
      const products = await this.productProvider.findMany(updateArticleDto.productIds)
      if (products.length !== updateArticleDto.productIds.length)
        throw notFoundException('محصول مورد نظر یافت نشد')
    }

    try {
      let existingArticle = await this.articleModel.findByIdAndUpdate(id, updateArticleDto, { new: true }).populate(this.productIdsPopulationObject).lean().exec()
      if (!existingArticle._id)
        throw notFoundException();
      existingArticle = (await this.replaceImageKeyOfArticles([existingArticle]))[0] as typeof existingArticle
      return existingArticle
    } catch (error) {
      if (error instanceof NotFoundException)
        throw notFoundException('آیدی مجله یافت نشد');

      throw requestTimeoutException('مشکلی در آپدیت کردن مجله رخ داده است')
    }
  }

  async remove(id: Types.ObjectId) {
    try {
      const deletedArticle = await this.articleModel.findByIdAndDelete(id, { new: true });

      if (!deletedArticle)
        throw new NotFoundException()

      await this.imageService.deleteImage(deletedArticle.imageKey)

      return id

    } catch (error) {
      if (error instanceof NotFoundException || error?.name == 'TypeError' || error?.name == 'CastError')
        throw notFoundException('آیدی مجله مورد نظر یافت نشد')
      throw requestTimeoutException('مشکلی در پاک کردن مجله رخ داده است')
    }
  }
}
