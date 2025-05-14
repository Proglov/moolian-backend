import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BoughtProducts, Transaction } from './transaction.schema';
import { Model, Types } from 'mongoose';
import { badRequestException, conflictException, forbiddenException, notFoundException, requestTimeoutException, unauthorizedException } from 'src/common/errors';
import { ProductProvider } from 'src/product/product.provider';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { FindAllDto } from 'src/common/findAll.dto';
import { FindOneDto } from 'src/common/findOne.dto';
import { TransactionProvider } from './transaction.provider';
import { PatchTransactionStatusBySellerDto } from './dto/patch-status.dto';
import { Status, volumeMultipliers } from './enums/transaction.enums';
import { CancelTransActionDto } from './dto/cancel-transaction.dto';
import { OpinionTransActionDto } from './dto/opinion-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';

@Injectable()
export class TransactionService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Transaction Model */
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,

    /**  Inject the product provider */
    private readonly productProvider: ProductProvider,

    /**  Inject the transaction provider */
    private readonly transactionProvider: TransactionProvider
  ) { }

  async create(userInfo: CurrentUserData, createTransactionDto: CreateTransactionDto): Promise<Types.ObjectId> {

    //* check if the shouldBeSentAt is after the latency
    const latency = 3_600_000    //? one hour
    if (parseInt(createTransactionDto.shouldBeSentAt) - Date.now() < latency)
      throw badRequestException('ارسال در این زمان مقدور نمیباشد!')

    if (!createTransactionDto.boughtProducts.length)
      throw badRequestException('محصولات ضروری میباشند')


    const uniqueProductIds = [...new Set(createTransactionDto.boughtProducts.map(bp => bp.productId))];


    const products = await this.productProvider.findManyWithFestivals(uniqueProductIds)

    //? Validate that all product IDs exist and check if we have the product
    for (const bp of createTransactionDto.boughtProducts) {
      const product = products.find(p => p._id.toString() === bp.productId.toString());
      if (!product) {
        throw badRequestException('آیدی محصولات صحیح نمیباشند');
      }
      if (!product.availability) {
        throw conflictException(`محصول مورد نظر (${product.nameFA}) موجود نمیباشد!`);
      }
    }


    let totalDiscount = 0
    let totalPrice = createTransactionDto.boughtProducts.reduce((acc, bp) => {
      const currentProduct = products.find(p => p._id.toString() === bp.productId.toString());

      const multiplier = volumeMultipliers[bp.volume];
      if (!multiplier) {
        throw badRequestException('حجم نامعتبر است');
      }

      //*the price of the product times its quantity times the volume multiplier
      const thisPrice = currentProduct.price * multiplier * bp.quantity;
      if (currentProduct.festival?.offPercentage > 0 && parseInt(currentProduct.festival?.until) >= Date.now())
        totalDiscount += thisPrice * currentProduct.festival.offPercentage / 100
      //TODO handle the major discount here
      // if (currentProduct?.majorShoppingOffPercentage > 0 && currentProduct?.quantity >= currentProduct?.majorQuantity)
      //   totalDiscount += thisPrice * currentProduct.majorShoppingOffPercentage / 100
      return acc + thisPrice
    }, 0)

    totalPrice -= totalDiscount

    //TODO handle the code discount here

    //TODO handle the shipping cost here
    const shippingCost = 50000;
    totalPrice += shippingCost;

    try {
      const newTransaction = new this.transactionModel({
        userId: userInfo.userId,
        shippingCost,
        totalPrice,
        boughtProducts: createTransactionDto.boughtProducts,
        address: createTransactionDto.address,
        shouldBeSentAt: createTransactionDto.shouldBeSentAt,
        totalDiscount: totalDiscount > 0 ? totalDiscount : undefined
      })

      await newTransaction.save();

      //TODO Send Notification

      return newTransaction?._id;
    } catch (error) {
      throw requestTimeoutException('مشکلی در ایجاد تراکنش رخ داده است')
    }
  }

  async findAll(query: GetTransactionsDto): Promise<FindAllDto<Transaction>> {
    const match: any = {}
    if (query.onlyRequested)
      match.status = Status.Requested
    return this.transactionProvider.findAll(match, query.limit, query.page)
  }

  async findAllMine(userInfo: CurrentUserData, limit: number, page: number): Promise<FindAllDto<Transaction>> {
    const condition = { userId: userInfo.userId }
    return this.transactionProvider.findAll(condition, limit, page)
  }

  async findAllOfAUser(findOneDto: FindOneDto, limit: number, page: number): Promise<FindAllDto<Transaction>> {
    const condition = { userId: findOneDto.id }
    return this.transactionProvider.findAll(condition, limit, page)
  }

  async findAllOfAProduct(findOneDto: FindOneDto, limit: number, page: number): Promise<FindAllDto<Transaction>> {
    const condition = {
      boughtProducts: {
        $elemMatch: { productId: findOneDto.id }
      }
    }
    return this.transactionProvider.findAll(condition, limit, page)
  }

  async findOne(findOneDto: FindOneDto): Promise<Transaction> {
    return await this.transactionProvider.findOne(findOneDto)
  }

  async toggleStatus(findOneDto: FindOneDto, query: PatchTransactionStatusBySellerDto) {
    const transaction = await this.transactionProvider.findOneWithInteraction(findOneDto)
    if (!transaction)
      throw notFoundException('آیدی تراکنش مورد نظر یافت نشد')

    try {
      transaction.status = query.status
      await transaction.save()
      return transaction
    } catch (error) {
      throw requestTimeoutException('مشکلی در آپدیت تراکنش رخ داده است')
    }
  }

  async cancelBySeller(findOneDto: FindOneDto, cancelTransActionDto: CancelTransActionDto) {
    const transaction = await this.transactionProvider.findOneWithInteraction(findOneDto)
    if (!transaction)
      throw notFoundException('آیدی تراکنش مورد نظر یافت نشد')

    try {
      transaction.status = Status.Canceled
      transaction.canceled = {
        didSellerCanceled: true,
        reason: cancelTransActionDto.reason
      }
      await transaction.save()
      return transaction
    } catch (error) {
      throw requestTimeoutException('مشکلی در آپدیت تراکنش رخ داده است')
    }
  }

  async cancelByUser(findOneDto: FindOneDto, userInfo: CurrentUserData, cancelTransActionDto: CancelTransActionDto) {
    const transaction = await this.transactionProvider.findOneWithInteraction(findOneDto)
    if (!transaction)
      throw notFoundException('آیدی تراکنش مورد نظر یافت نشد')
    if (!transaction.userId.equals(userInfo.userId))
      throw unauthorizedException("شما احراز هویت نشده اید")
    if (transaction.status === Status.Canceled)
      throw forbiddenException("سفارش از قبل کنسل شده است!")
    if (transaction.status !== Status.Requested)
      throw forbiddenException("امکان کنسل کردن سفارش پس از تایید آن ممکن نمیباشد")
    try {
      transaction.status = Status.Canceled
      transaction.canceled = {
        didSellerCanceled: false,
        reason: cancelTransActionDto.reason
      }
      await transaction.save()
      return transaction
    } catch (error) {
      throw requestTimeoutException('مشکلی در آپدیت تراکنش رخ داده است')
    }
  }

  async opinion(findOneDto: FindOneDto, userInfo: CurrentUserData, opinionTransActionDto: OpinionTransActionDto) {
    const transaction = await this.transactionProvider.findOneWithInteraction(findOneDto)
    if (!transaction)
      throw notFoundException('آیدی تراکنش مورد نظر یافت نشد')
    if (transaction.status !== Status.Received && transaction.status !== Status.Canceled)
      throw badRequestException('تنها امکان نظر دادن به سفارشات پس از دریافت یا لغو امکان پذیر است')
    if (!transaction.userId.equals(userInfo.userId))
      throw unauthorizedException("شما احراز هویت نشده اید")
    try {
      transaction.opinion = opinionTransActionDto
      await transaction.save()
      return transaction
    } catch (error) {
      throw requestTimeoutException('مشکلی در آپدیت تراکنش رخ داده است')
    }
  }
}
