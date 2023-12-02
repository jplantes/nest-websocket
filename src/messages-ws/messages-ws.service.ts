import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConectedCliente {
  [id: string]: {
    socket: Socket,
    user: User,
  }
}

@Injectable()
export class MessagesWsService {

  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  private connectedCliente: ConectedCliente = {};

  async registerClient(client: Socket, userId: string ) {

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user ) throw new Error('Usuario no existe');
    if ( !user.isActive ) throw new Error('Usuario inactivo');

    this.chackUserConnection( user );
    this.connectedCliente[client.id] = {socket: client, user };
  }

  removeClient(clientId: string) {
    delete this.connectedCliente[clientId];
  }

  getConnectedClient(): string[] {
    return Object.keys(this.connectedCliente);
  }

  getUserFullName( socktId: string ) {
    return this.connectedCliente[socktId].user.fullName;
  }

  private chackUserConnection( user: User ) {

    for (const clientId of Object.keys( this.connectedCliente )) {
      
      const connectedClient = this.connectedCliente[ clientId ];

      if ( connectedClient.user.id === user.id ) {
        connectedClient.socket.disconnect();
        break;
      }

    }
  }
}
