import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { initialData } from './data/seedInitial';

import { ProductsService } from 'src/products/products.service';

import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>
  ){}



  async runSeed() {
    await this.deleteTables();

    const firstUser = await this.insertUsers();

    await this.insertNewProduct( firstUser );
    return 'This action adds a new seed';
  }


  private async deleteTables() {
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
    .delete()
    .where({})
    .execute();
  }

  private async insertUsers () {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( user => {
      user.password = bcrypt.hashSync( user.password, 10 );
      users.push( this.userRepository.create( user ) );
    });

    const dbUsers = await this.userRepository.save( seedUsers );

    return dbUsers[0];
  }

  private async insertNewProduct( user: User) {
    await this.productService.deleteAllProducts();

    const productos = initialData.products;
    const insertPromises = [];
    
    productos.forEach( prod => {
      insertPromises.push(this.productService.create( prod, user ));
    });

    await Promise.all( insertPromises );

    return true;
  }
}
