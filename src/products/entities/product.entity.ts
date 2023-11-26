import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {

  @ApiProperty({
    example: "18d5b540-5552-40c3-af0d-b2cc0b9e09ba",
    description: "ID de producto",
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: "Pantalon corto",
    description: "Titulo del producto",
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: "200",
    description: "Precio del producto",
    default: 0,
    uniqueItems: false,
  })
  @Column('float', {
    default: 0,
  })
  price: number;


  @ApiProperty({
    example: "Pantalon corto de tela",
    description: "Descripción del producto",
    uniqueItems: false,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;


  @ApiProperty()
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty()
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty()
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty()
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty()
  @OneToMany(
    () => ProductImage,
    (productoImage) => productoImage.product,
    { cascade: true, eager: true },
  )
  images?: ProductImage[];

  @ManyToOne(
    () => User, // Entidad con la que se relaciona
    ( user ) => user.product,
    { eager: true }, // Carga automaticamente los datos relacionados
  )
  user: User

  @BeforeInsert()
  checkSlugInsert() {
    if ( !this.slug ){
      this.slug = this.title
    }

    this.slug = this.slug
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll("'", '');
  }
}
