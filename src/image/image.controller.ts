import { Controller, Post, HttpStatus, HttpCode, UseInterceptors, UploadedFile, Patch } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { getFileValidator } from './validators/image.validation';
import { ImageService } from './image.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { FileExtender } from './interceptors/fileExtender.interceptor';


/**
 * End points related to the Image operations
 */
@Controller('image')
export class ImageController {

  /** Inject the dependencies */
  constructor(
    /**  Inject the image service */
    private readonly imageService: ImageService
  ) { }


  /** Upload an image */
  @Post()
  // @Auth(AuthType.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'uploads an image' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'successfully added the image' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Request time out' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'only admins can upload images' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        }
      }
    }
  })
  async uploadImage(
    @UploadedFile(getFileValidator()) file: Express.Multer.File
  ) {
    return await this.imageService.uploadImage(file.originalname, file.mimetype, file.buffer)
  }


  /** Upload an image */
  @Patch()
  // @Auth(AuthType.Admin)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'updates an existing image' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'successfully added the image' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Request time out' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'only admins can upload images' })
  @UseInterceptors(FileExtender)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        filename: { type: 'string' }
      }
    }
  })
  async updateImage(
    @UploadedFile(getFileValidator()) file: Express.Multer.File
  ) {
    return await this.imageService.updateImage(file.filename, file.buffer)
  }

}