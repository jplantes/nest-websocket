import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
  ],
  imports: [
    ConfigModule,

    TypeOrmModule.forFeature([
      User,
    ]),

    PassportModule.register({
      defaultStrategy: 'jwt'
    }),

    // ----- Configuración sincrona -----
    // JwtModule.register({
    //   secret: process.env.JWT_SECCRET,
    //   signOptions: {
    //     expiresIn: '2h'
    //   }
    // })

    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => {
        return {
          secret: configService.get('JWT_SECCRET'),
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    }),
  ],
  exports: [
    TypeOrmModule,
    PassportModule,
    JwtStrategy,
    JwtModule,
  ]
})
export class AuthModule {}
