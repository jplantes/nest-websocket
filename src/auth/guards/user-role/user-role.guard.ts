import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor (
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler() );

    // Si no se especifica en el decorador ningun rol lo dejo pasar porque solo me interesa que este autenticado
    if ( !validRoles ) return true;
    if ( validRoles.length === 0 ) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if ( !user ) throw new InternalServerErrorException('No se encuentra el usuario en la request');

    for (const role of user.roles) {
      if ( validRoles.includes( role ) ){
        return true;
      }
    }

    throw new ForbiddenException( `El usuario ${ user.fullName } no tiene ninguno de los siguientes roles ${ validRoles }` );

  }
}
