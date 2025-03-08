import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { FollowRequestService } from './follow-request.service';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class FollowRequestGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly followRequestService: FollowRequestService) {}

  async notifyNewFollowRequest(userId: string) {
    const requests =
      await this.followRequestService.getPendingFollowRequests(userId);
    this.server.emit('newFollowRequest', { userId, requests });
  }
}
