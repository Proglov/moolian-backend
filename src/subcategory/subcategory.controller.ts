import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FindOneDto } from 'src/common/findOne.dto';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { Subcategory } from './subcategory.schema';

@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) { }


  @Auth(AuthType.Admin)
  @Post()
  @ApiOperation({ summary: 'creates a category' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Subcategory created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Subcategory name has conflict' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'categoryId is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Subcategory is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @Body() createSubcategoryDto: CreateSubcategoryDto
  ) {
    return await this.subcategoryService.create(createSubcategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'returns all categories based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Categories found', type: FindAllDto<Subcategory> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Categories are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.subcategoryService.findAll(query.limit, query.page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'returns a subcategory with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Subcategory found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Subcategory Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Subcategory is not found' })
  async findOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.subcategoryService.findOne(findOneDto);
  }
}
