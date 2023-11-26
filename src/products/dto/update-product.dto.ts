//import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger'; // Lo importamos asi para que nos tome los decoradores de la documentación
import { CreateProductDto } from './create-product.dto';


export class UpdateProductDto extends PartialType(CreateProductDto) {}
