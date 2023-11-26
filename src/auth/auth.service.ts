import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}
  
  async create(createUserDto: CreateUserDto) {

    const { password, ...userData } = createUserDto;

    try {
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 ),
      });


      await this.userRepository.save( user );
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
    } catch (error) {
      this.handleDBError(error);
    }
    
  }


  async login ( loginUserDto: LoginUserDto ) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if ( !user ) 
      throw new UnauthorizedException('Error usuario o contraseña (u)');
    
    if ( !bcrypt.compareSync(password, user.password ) ) 
      throw new UnauthorizedException('Error usuario o contraseña (p)');

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async checkAuthStatus ( user: User ) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  private handleDBError ( error: any ): never {
    if ( error.code === '23505') throw new BadRequestException( error.details );

    console.log( error );
    throw new InternalServerErrorException('Por favor ver el detalle en el log');
  }

  private getJwtToken ( payload: JwtPayload ) {
    return this.jwtService.sign( payload );
  }

}
