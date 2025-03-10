import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Query, Res, Req } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { City } from './city.schema';
import { FindOneDto } from 'src/common/findOne.dto';
import { Request, Response } from 'express';
import { CitiesIdsDto } from './dto/set-cities-Ids.dto';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) { }

  @Auth(AuthType.Admin)
  @Post()
  @ApiOperation({ summary: 'creates a city' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'City created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'City name has conflict' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'provinceId is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'City is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @Body() createCityDto: CreateCityDto
  ) {
    return await this.cityService.create(createCityDto);
  }

  @Get()
  @ApiOperation({ summary: 'returns all cities based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Cities found', type: FindAllDto<City> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Cities are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.cityService.findAll(query.limit, query.page);
  }

  @Post('home-page')
  @ApiOperation({ summary: 'returns all cities and provinces for the navbar, alongside the preSelected cities in the cookies' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'CitiesIds are set successfully' })
  async setCitiesCookies(
    @Body() ids: CitiesIdsDto[],
    @Res({ passthrough: true }) response: Response
  ) {
    return await this.cityService.setCitiesIds(response, ids);
  }

  @Get('home-page')
  @ApiOperation({ summary: 'returns all cities and provinces for the home page, alongside the preSelected cities in the cookies' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Cities found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Cities are not found' })
  async getAllCitiesForHomePage(
    @Req() req: Request
  ) {
    return await this.cityService.getAllCitiesForHomePage(req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'returns a city with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'City found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'City Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'City is not found' })
  async findOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.cityService.findOne(findOneDto);
  }

}
