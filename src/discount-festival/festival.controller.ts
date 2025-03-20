import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { FestivalService } from './festival.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { Festival } from './festival.schema';
import { FindAllDto } from 'src/common/findAll.dto';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindOneDto } from 'src/common/findOne.dto';

@Controller('festival')
export class FestivalController {
  constructor(private readonly festivalService: FestivalService) { }

  @Auth(AuthType.Admin)
  @Post()
  @ApiOperation({ summary: 'creates a festival' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Festival created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Festival productId has conflict' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'productId is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Festival is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @Body() createFestivalDto: CreateFestivalDto
  ) {
    return await this.festivalService.create(createFestivalDto);
  }

  @Auth(AuthType.Admin)
  @Get()
  @ApiOperation({ summary: 'returns all festivals based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Festivals found', type: FindAllDto<Festival> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Festivals are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.festivalService.findAll(query.limit, query.page);
  }

  @Get('home-page')
  @ApiOperation({ summary: 'returns 10 festivals' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Festivals found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Festivals are not found' })
  async findAllForHomePage() {
    return await this.festivalService.findAllForHomePage();
  }

  @Auth(AuthType.Admin)
  @Delete(':id')
  @Post()
  @ApiOperation({ summary: 'deletes a festival' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Festival deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'festival is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Festival is not deleted' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  remove(
    @Param() findOneDto: FindOneDto
  ) {
    return this.festivalService.remove(findOneDto.id);
  }

}
