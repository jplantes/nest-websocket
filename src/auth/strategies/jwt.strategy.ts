import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

import { Repository } from "typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";


import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { User } from "../entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

  constructor (

    @InjectRepository( User )
    private readonly userRepository: Repository<User>,

    // El configService es para obtener las ENV
    consfigService: ConfigService,
  ) {
    // Esto es porque extiende de PassportStrategy
    super({
      secretOrKey: consfigService.get('JWT_SECCRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate( payload: JwtPayload ): Promise<User> {
    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });

    if ( !user ) throw new UnauthorizedException('El token no es valido');
    if ( !user.isActive ) throw new UnauthorizedException('El usuario no esta activo');

    return user;
  }


}