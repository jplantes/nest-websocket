import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { NewMessageDto } from './dtos/new-message.dto';

import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}
  
  async handleConnection(client: Socket ) {
    
    const token = client.handshake.headers.authentication as string; 
    let payload: JwtPayload;
    
    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );
    } catch (error) {
      client.disconnect();
      return;
    }
    
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClient() );
  }
  
  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado', client.id );
    this.messagesWsService.removeClient( client.id );
   
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClient() );
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient ( client: Socket, payload: NewMessageDto ) {
    
    //! Esta forma solo notifica al usuario que tubo la interacción con el servidor
    // client.emit('message-from-server', {
    //   fullName: 'nobre del usuario',
    //   message: payload.message
    // });

    //! Emitir a todos menos al cliente que tubo la interacción
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'nobre del usuario',
    //   message: payload.message
    // });

    //! Emitir a todos incluso al tubo interacción con el servidor
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName( client.id ),
      message: payload.message || ''
    });
  }

}
