import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindOneDto } from 'src/common/findOne.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }


  @Auth(AuthType.Bearer)
  @Post()
  @ApiOperation({ summary: 'creates a comment' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Comment created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Comment name has conflict' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'provinceId is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Comment is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() userInfo: CurrentUserData
  ) {
    return await this.commentService.create(createCommentDto, userInfo);
  }

  @Get()
  @ApiOperation({ summary: 'returns all comments based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Comments found', type: FindAllDto<Comment> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Comments are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.commentService.findAll(query.limit, query.page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'returns a comment with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Comment found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Comment Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Comment is not found' })
  async findOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.commentService.findOne(findOneDto);
  }

  @Auth(AuthType.Admin)
  @Delete(':id')
  @Post()
  @ApiOperation({ summary: 'deletes a comment' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Comment deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'comment is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Comment is not deleted' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  remove(
    @Param() findOneDto: FindOneDto
  ) {
    return this.commentService.remove(findOneDto.id);
  }

  @Auth(AuthType.Admin)
  @Patch(':id/toggle')
  @ApiOperation({ summary: 'toggles validation of a comment' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Comment validation toggled' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'comment is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Comment validation is not toggled' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  toggleValidation(
    @Param() findOneDto: FindOneDto
  ) {
    return this.commentService.toggleValidation(findOneDto.id);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id/like')
  @ApiOperation({ summary: 'toggles like of a comment' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Comment like toggled' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'comment is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Comment like is not toggled' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  like(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() userInfo: CurrentUserData
  ) {
    return this.commentService.toggleLikeOrDisLike(findOneDto.id, userInfo, 'likeIds', 'disLikeIds');
  }

  @Auth(AuthType.Bearer)
  @Patch(':id/dislike')
  @ApiOperation({ summary: 'toggles disLike of a comment' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Comment disLike toggled' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'comment is not found' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Comment disLike is not toggled' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  dislike(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() userInfo: CurrentUserData
  ) {
    return this.commentService.toggleLikeOrDisLike(findOneDto.id, userInfo, 'disLikeIds', 'likeIds');
  }
}
