import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID } from 'uuid';

import { Product, ProductImage } from './entities';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginetionDto } from 'src/common/dtos/pagination.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  
  private readonly logger = new Logger('ProductoService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSourse: DataSource,
  ){}
  
  async create( createProductDto: CreateProductDto, user: User ) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const producto = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image })),
        user,
      });

      await this.productRepository.save(producto)

      return { ...producto, images };
    } catch (error) { this.handleExceptions( error ) }

  }

  async findAll( paginationDto: PaginetionDto ) {

    //!Paginación
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const productos =  await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        }
      });

      return productos.map( product => ({
        ...product,
        images: product.images.map( img => img.url )
      }));


    } catch (error) { this.handleExceptions( error ) }
  }

  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map( i => i.url )
    }

  }

  async findOne(term: string) {
    let producto: Product;

    if( isUUID(term) ){

      producto = await this.productRepository.findOneBy({ id: term });
    
    } else {
    
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      producto = await queryBuilder
      .where(`UPPER(title) = :title or slug = :slug`, {
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
      })
      .leftJoinAndSelect( 'prod.images', 'prodImages' )
      .getOne();
    
    }

    if( !producto )
      throw new NotFoundException(`El producto con el termino ${ term } no fue encontrado`);

    return producto;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate} = updateProductDto;
    
    const producto = await this.productRepository.preload({
      id,
      ...toUpdate
    });

    if ( !producto ) throw new NotFoundException(`El producto con el ID ${id} no fue encontrado`);

    // Query runner
    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (images) {
        await queryRunner.manager.delete( ProductImage, { product: { id } });

        producto.images = images.map( i => this.productImageRepository.create({ url: i }));
      } else {

      }

      producto.user = user;
      await queryRunner.manager.save( producto );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      // await this.productRepository.save( producto );
      return producto;
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleExceptions( error )
    }
    
  }

  async remove(id: string) {
    const producto = await this.findOne( id )
    await this.productRepository.remove( producto );
  }

  private handleExceptions( error: any ) {
    console.log( error );
    if ( error.code === '23505' ){
      throw new BadRequestException( error.detail );
    }

    this.logger.error( error );
    throw new InternalServerErrorException('Error no esperado, por favor ver los logs');
  }

  async deleteAllProducts () {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
      .delete()
      .where({})
      .execute();

    } catch (error) {
      this.handleExceptions( error );
    }
  }
}
