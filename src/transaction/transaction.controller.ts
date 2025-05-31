import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Query, Patch } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { Transaction } from './transaction.schema';
import { FindOneDto } from 'src/common/findOne.dto';
import { PatchTransactionStatusBySellerDto } from './dto/patch-status.dto';
import { CancelTransActionDto } from './dto/cancel-transaction.dto';
import { OpinionTransActionDto } from './dto/opinion-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Auth(AuthType.Bearer)
  @Post()
  @ApiOperation({ summary: 'creates a transaction and returns the payment url string' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transaction created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Transaction is not valid' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'productId is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transaction is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @CurrentUser() userInfo: CurrentUserData,
    @Body() createTransactionDto: CreateTransactionDto
  ) {
    return await this.transactionService.create(userInfo, createTransactionDto);
  }

  @Auth(AuthType.Admin)
  @Get()
  @ApiOperation({ summary: 'returns all transactions based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Transactions found', type: FindAllDto<Transaction> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transactions are not found' })
  async findAll(
    @Query() query: GetTransactionsDto
  ) {
    return await this.transactionService.findAll(query);
  }

  @Auth(AuthType.Bearer)
  @Get('mine')
  @ApiOperation({ summary: 'returns all transactions of the user based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Transactions found', type: FindAllDto<Transaction> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transactions are not found' })
  async findAllMine(
    @CurrentUser() userInfo: CurrentUserData,
    @Query() query: PaginationDto
  ) {
    return await this.transactionService.findAllMine(userInfo, query.limit, query.page);
  }

  @Auth(AuthType.Admin)
  @Get('user/:id')
  @ApiOperation({ summary: 'returns all transactions of the user based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Transactions found', type: FindAllDto<Transaction> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transactions are not found' })
  async findAllOfAUser(
    @Param() findOneDto: FindOneDto,
    @Query() query: PaginationDto
  ) {
    return await this.transactionService.findAllOfAUser(findOneDto, query.limit, query.page);
  }

  @Auth(AuthType.Admin)
  @Get('product/:id')
  @ApiOperation({ summary: 'returns all transactions of the product based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Transactions found', type: FindAllDto<Transaction> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transactions are not found' })
  async findAllOfAProduct(

    @Param() findOneDto: FindOneDto,
    @Query() query: PaginationDto
  ) {
    return await this.transactionService.findAllOfAProduct(findOneDto, query.limit, query.page);
  }

  @Auth(AuthType.Admin)
  @Get(':id')
  @ApiOperation({ summary: 'returns a transaction with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Transaction found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Transaction Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transaction is not found' })
  async findOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.transactionService.findOne(findOneDto);
  }

  @Auth(AuthType.Admin)
  @Patch(':id/status')
  @ApiOperation({ summary: 'toggles status of a transaction' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Transaction status toggled' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'transaction is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transaction status is not toggled' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async toggleStatus(
    @Param() findOneDto: FindOneDto,
    @Query() query: PatchTransactionStatusBySellerDto
  ) {
    return await this.transactionService.toggleStatus(findOneDto, query);
  }

  @Auth(AuthType.Admin)
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'cancels the transaction by the seller' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Transaction status toggled' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'transaction is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transaction status is not toggled' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async cancelBySeller(
    @Param() findOneDto: FindOneDto,
    @Body() cancelTransActionDto: CancelTransActionDto
  ) {
    return await this.transactionService.cancelBySeller(findOneDto, cancelTransActionDto);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id/cancel/user')
  @ApiOperation({ summary: 'cancels the transaction by the user' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Transaction status toggled' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'User is trying to cancel the accepted transaction' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'transaction is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transaction status is not toggled' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async cancelByUser(
    @Param() findOneDto: FindOneDto,
    @Body() cancelTransActionDto: CancelTransActionDto,
    @CurrentUser() userInfo: CurrentUserData
  ) {
    return await this.transactionService.cancelByUser(findOneDto, userInfo, cancelTransActionDto);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id/opinion')
  @ApiOperation({ summary: 'cancels the transaction by the user' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Transaction status toggled' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'User is trying to cancel the accepted transaction' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Transaction status is neither canceled nor received!' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'transaction is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Transaction status is not toggled' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async opinion(
    @Param() findOneDto: FindOneDto,
    @Body() opinionTransActionDto: OpinionTransActionDto,
    @CurrentUser() userInfo: CurrentUserData
  ) {
    return await this.transactionService.opinion(findOneDto, userInfo, opinionTransActionDto);
  }
}
