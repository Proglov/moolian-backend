import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { AuthType } from 'src/auth/enums/auth-types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { Brand } from './brand.schema';
import { FindOneDto } from 'src/common/findOne.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @Auth(AuthType.Admin)
  @Post()
  @ApiOperation({ summary: 'creates a brand' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Brand created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Brand name has conflict' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Brand is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @Body() createBrandDto: CreateBrandDto
  ) {
    return await this.brandService.create(createBrandDto, true);
  }

  @Get()
  @ApiOperation({ summary: 'returns all brands based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Brands found', type: FindAllDto<Brand> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Brands are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.brandService.findAll(query.limit, query.page, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'returns a brand with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Brand found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Brand Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Brand is not found' })
  async findOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.brandService.findOne(findOneDto, true);
  }

}
