import { Response } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { FilesService } from './files.service';

import { fileFiltar } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {

  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) { }

  @Get('product/:imageName')
  findOneImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName)

    res.sendFile( path );
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', { // "file" <- es la propiedad del body que estoy esperando
    fileFilter: fileFiltar,
    //limits: { fileSize: 5000 },
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer,
    })
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ) {

    if (!file) {
      throw new BadRequestException('No se envio una imagen');
    }

    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`


    return secureUrl;

  }

}
