import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

import { Auth, GetUser, RawHeader, RoleProtected } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('singup')
  create(
    @Body() createUserDto: CreateUserDto
  ) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(
    @Body() loginUserDto: LoginUserDto
  ) {
    return this.authService.login(loginUserDto);
  }

  @Get('checkauthstatus')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus( user );
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testinPrivateRoute (
    @Req() request: Express.Request,

    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeader() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'Mensaje privado'
    }
  }

  // Este SetMetadata tienen que estar para que funcione mi UserRoleGuard
  // @SetMetadata('roles', ['admin', 'super-user'])

  @Get('private2')
  // Esto reemplaza a @SetMetaData
  @RoleProtected( ValidRoles.superUser, ValidRoles.admin )
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRouter2(
    @GetUser() user: User,
  ){

    return {
      ok: true,
      user
    }
  }

  @Get('private3')
  @Auth( ValidRoles.user )
  privateRouter3(
    @GetUser() user: User,
  ){

    return {
      ok: true,
      user
    }
  }
}
