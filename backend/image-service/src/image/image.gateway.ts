import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ImageGateway {
  @WebSocketServer() server: Server;

  notifyNewPost() {
    this.server.emit('postsUpdated');
  }
}
