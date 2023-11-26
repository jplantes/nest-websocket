import { join } from 'path';
import { existsSync } from 'fs';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {


  getStaticProductImage ( imageNmae: string ) {

    const path = join( __dirname, '../../static/products', imageNmae )

    if ( !existsSync( path ) ) throw new BadRequestException('El archivo no existe')

    return path;
  }
}
