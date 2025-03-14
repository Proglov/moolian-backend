import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindAllDto } from 'src/common/findAll.dto';
<<<<<<< HEAD
import { PopulatedProduct } from './dto/populated-product.type';
=======
import { Product } from './product.schema';
>>>>>>> 182af03af503ee12f2d85c06054eb39812d17f0d

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Auth(AuthType.Admin)
  @Post()
  @ApiOperation({ summary: 'creates a product' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Product name has conflict' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Product is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "some ids can't be found" })
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto, true);
  }

  @Get()
  @ApiOperation({ summary: 'returns all products based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
<<<<<<< HEAD
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Products found', type: FindAllDto<PopulatedProduct> })
=======
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Products found', type: FindAllDto<Product> })
>>>>>>> 182af03af503ee12f2d85c06054eb39812d17f0d
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Products are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.productService.findAll(query.limit, query.page, true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

}
