import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Query, Patch, Delete } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { AuthType } from 'src/auth/enums/auth-types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { Note } from './note.schema';
import { FindOneDto } from 'src/common/findOne.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) { }

  @Auth(AuthType.Admin)
  @Post()
  @ApiOperation({ summary: 'creates a note' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Note created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Note name has conflict' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Note is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @Body() createNoteDto: CreateNoteDto
  ) {
    return await this.noteService.create(createNoteDto, true);
  }

  @Get()
  @ApiOperation({ summary: 'returns all notes based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Notes found', type: FindAllDto<Note> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Notes are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.noteService.findAll(query.limit, query.page, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'returns a note with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Note found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Note Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Note is not found' })
  async findOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.noteService.findOne(findOneDto, true);
  }

  @Patch(':id')
  @Auth(AuthType.Admin)
  @ApiOperation({ summary: 'updates a note with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Note updated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Note Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Note is not updated' })
  async updateOne(
    @Param() findOneDto: FindOneDto,
    @Body() updateNoteDto: UpdateNoteDto
  ) {
    return await this.noteService.updateOne(findOneDto.id, updateNoteDto);
  }

  @Delete(':id')
  @Auth(AuthType.Admin)
  @ApiOperation({ summary: 'deletes a note with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Note deleted' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Note Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Note is not deleted' })
  async deleteOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.noteService.deleteOne(findOneDto.id);
  }

}
