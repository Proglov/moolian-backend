import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Festival } from './festival.schema';
import { Model, Types } from 'mongoose';
import { badRequestException, notFoundException, requestTimeoutException } from 'src/common/errors';
import { ProductProvider } from 'src/product/product.provider';
import { FindAllDto } from 'src/common/findAll.dto';
import { Product } from 'src/product/product.schema';

@Injectable()
export class FestivalService {

    /** Inject the dependencies */
    constructor(
        /**  Inject the Festival Model */
        @InjectModel(Festival.name)
        private readonly festivalModel: Model<Festival>,

        /**  Inject the product provider */
        private readonly productProvider: ProductProvider
    ) { }

    async create(createFestivalDto: CreateFestivalDto) {
        const product = await this.productProvider.findOne({ id: createFestivalDto.productId })
        if (!product)
            throw notFoundException('محصول مورد نظر یافت نشد')

        try {
            const newFestival = new this.festivalModel(createFestivalDto)
            await newFestival.save();
            return {
                _id: newFestival._id,
                nameFA: product.nameFA,
                productId: product._id,
                offPercentage: createFestivalDto.offPercentage,
                until: createFestivalDto.until
            }
        } catch (error) {
            //* mongoose duplication error
            if (error?.code === 11000 && Object.keys(error?.keyPattern)[0] === 'productId')
                throw badRequestException('این محصول قبلا تخفیف خورده است!');

            throw requestTimeoutException('مشکلی در ایجاد جشنواره تخفیف رخ داده است')
        }
    }

    async findAll(limit: number, page: number): Promise<FindAllDto<Festival>> {
        try {
            const skip = (page - 1) * limit;

            const query = this.festivalModel.find().populate(
                {
                    path: "productId",
                    select: "nameFA price"

                }
            ).skip(skip).limit(limit)

            const [festivalProducts, count] = await Promise.all([
                query.lean().exec() as unknown as Festival[],
                this.festivalModel.countDocuments()
            ]);

            return {
                count,
                items: festivalProducts
            }

        } catch (error) {
            throw requestTimeoutException('مشکلی در گرفتن محصولات جشنواره ای رخ داده است')
        }
    }

    async findAllForHomePage(): Promise<any[]> {
        try {
            const festivalProducts = await this.festivalModel.find()
                .populate({
                    path: "productId",
                    select: "nameFA price imageKeys"
                }).limit(10).lean().exec();

            const products = festivalProducts.map(f => f.productId as unknown as Product);
            const withImageProducts = await this.productProvider.replaceTheImageKeysOnlyOfProducts(products);

            const productMap = new Map(withImageProducts.map(product => [product._id.toString(), product]));
            return festivalProducts.map(festival => ({
                ...festival,
                productId: productMap.get(festival.productId._id.toString())
            }));
        } catch (error) {
            throw requestTimeoutException('مشکلی در گرفتن محصولات جشنواره ای رخ داده است');
        }
    }

    async remove(id: Types.ObjectId) {
        try {

            const deletedFestival = await this.festivalModel.findByIdAndDelete(id, { new: true });

            if (!deletedFestival)
                throw new NotFoundException()

            return id

        } catch (error) {
            if (error instanceof NotFoundException || error?.name == 'TypeError' || error?.name == 'CastError')
                throw notFoundException('آیدی جشنواره مورد نظر یافت نشد')
            throw requestTimeoutException('مشکلی در پاک کردن جشنواره رخ داده است')
        }
    }

    async deleteExpiredFestivals() {
        try {
            const now = Date.now()
            const conditionQuery = { until: { $lte: now } }
            await this.festivalModel.deleteMany(conditionQuery);
        } catch (error) {
            throw requestTimeoutException('مشکلی در پاک کردن جشنواره رخ داده است')
        }
    }

}
