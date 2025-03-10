import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ProvinceService } from './province.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindOneDto } from 'src/common/findOne.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { Province } from './province.schema';

@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) { }

  @Auth(AuthType.Admin)
  @Post()
  @ApiOperation({ summary: 'creates a province' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Province created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Province name has conflict' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Province is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @Body() createProvinceDto: CreateProvinceDto
  ) {
    return await this.provinceService.create(createProvinceDto);
  }

  @Get()
  @ApiOperation({ summary: 'returns all categories based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Categories found', type: FindAllDto<Province> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Categories are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.provinceService.findAll(query.limit, query.page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'returns a province with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Province found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Province Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Province is not found' })
  async findOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.provinceService.findOne(findOneDto);
  }
}
