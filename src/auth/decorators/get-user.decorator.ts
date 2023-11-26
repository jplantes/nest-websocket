import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator(
  ( data: string, ctx: ExecutionContext ) => {
    const req = ctx.switchToHttp().getRequest();

    const user = req.user;

    if ( !user ) throw new InternalServerErrorException('No se encuentra el usuario en la request');

    return ( !data) ? user : user[data];
  }
);