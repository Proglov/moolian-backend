import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
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

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Auth(AuthType.Bearer)
  @Post()
  @ApiOperation({ summary: 'creates a transaction' })
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
    @Query() query: PaginationDto
  ) {
    return await this.transactionService.findAll(query.limit, query.page);
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
}
