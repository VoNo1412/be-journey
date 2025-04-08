import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  // Gửi noti đến một user cụ thể (theo userId)
  sendNotificationToUser(userId: string, data: INotification) {
    this.server.to(userId).emit('notification', { data });
  }
}
