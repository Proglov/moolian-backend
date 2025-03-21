import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { Article } from './article.schema';
import { FindOneDto } from 'src/common/findOne.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  @Auth(AuthType.Admin)
  @Post()
  @ApiOperation({ summary: 'creates an article' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Article created' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'at least one of articleIds is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Article is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @Body() createArticleDto: CreateArticleDto
  ) {
    return await this.articleService.create(createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'returns all articles based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Articles found', type: FindAllDto<Article> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Articles are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.articleService.findAll(query.limit, query.page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'returns a article with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Article found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Article Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Article is not found' })
  async findOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.articleService.findOne(findOneDto);
  }

  @Auth(AuthType.Admin)
  @Patch(':id')
  @ApiOperation({ summary: 'updates a article' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Article updated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Article name has conflict' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Article is not updated' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "some ids can't be found" })
  update(
    @Param() findOneDto: FindOneDto,
    @Body() updateArticleDto: UpdateArticleDto
  ) {
    return this.articleService.update(findOneDto.id, updateArticleDto);
  }

  @Auth(AuthType.Admin)
  @Delete(':id')
  @Post()
  @ApiOperation({ summary: 'deletes a article' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Article deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'article is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Article is not deleted' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  remove(
    @Param() findOneDto: FindOneDto
  ) {
    return this.articleService.remove(findOneDto.id);
  }
}
