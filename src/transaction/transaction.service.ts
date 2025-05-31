import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './transaction.schema';
import { Model, Types } from 'mongoose';
import { badRequestException, conflictException, forbiddenException, internalServerErrorException, notFoundException, requestTimeoutException, unauthorizedException } from 'src/common/errors';
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
import { FirebaseService } from 'src/firebase/firebase.service';
import { PaymentProvider } from 'src/payment/payment.provider';
import { UsersProvider } from 'src/users/users.provider';

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
    private readonly transactionProvider: TransactionProvider,

    /**  Inject the users provider */
    private readonly usersProvider: UsersProvider,

    /**  Inject the firebase service */
    private readonly firebaseService: FirebaseService,

    /**  Inject the payment provider */
    @Inject(forwardRef(() => PaymentProvider))
    private readonly paymentProvider: PaymentProvider
  ) { }

  async create(userInfo: CurrentUserData, createTransactionDto: CreateTransactionDto): Promise<string> {

    if (!createTransactionDto.boughtProducts.length)
      throw badRequestException('محصولات ضروری میباشند')

    const user = await this.usersProvider.findOneByID(userInfo.userId);
    if (!user)
      throw unauthorizedException('کاربر مورد نظر یافت نشد');

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
      return acc + thisPrice
    }, 0)

    totalPrice -= totalDiscount

    //TODO handle the shipping cost here
    const shippingCost = 50000;
    totalPrice += shippingCost;

    let newTransaction: Transaction;
    try {
      newTransaction = new this.transactionModel({
        userId: userInfo.userId,
        shippingCost,
        totalPrice,
        boughtProducts: createTransactionDto.boughtProducts,
        address: createTransactionDto.address,
        shouldBeSentAt: '1842237668599', //TODO handle the time of sending
        totalDiscount: totalDiscount > 0 ? totalDiscount : undefined
      })
      await newTransaction.save();
    } catch (error) {
      throw requestTimeoutException('مشکلی در ایجاد تراکنش رخ داده است')
    }

    let paymentUrl: string;
    try {
      paymentUrl = await this.paymentProvider.requestPayment(newTransaction, user.phone);

    } catch (error) {
      throw internalServerErrorException('مشکلی در ارتباط با درگاه پرداخت رخ داده است؛ لطفا با پشتیبانی تماس بگیرید')
    }

    //? Send Notification
    this.firebaseService.sendNotificationToAdmins(
      'سفارش جدید',
      `کاربری به اندازه ${totalPrice} تومان خرید کرده است`
    )

    return paymentUrl;
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
    return await this.transactionProvider.toggleStatus(findOneDto, query)
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

    //* time check: allow cancel only within 1 hour of creation
    const cancellationLimit = 60 * 60 * 1000; // 1hr
    if (Date.now() - transaction.createdAt.getTime() > cancellationLimit) {
      throw forbiddenException("امکان کنسل کردن سفارش پس از گذشت ۱ ساعت وجود ندارد");
    }

    try {
      transaction.status = Status.Canceled
      transaction.canceled = {
        didSellerCanceled: false,
        reason: cancelTransActionDto.reason
      }
      await transaction.save();

      //? Send Notification
      this.firebaseService.sendNotificationToAdmins(
        'لغو سفارش',
        'کاربری سفارش خود را لغو کرد'
      )

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
