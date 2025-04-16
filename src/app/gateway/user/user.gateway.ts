import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/app/user/user.service';

@WebSocketGateway({ cors: true, path: '/user' })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    public server: Server;

    constructor(private readonly userService: UserService) { }

    async handleConnection(client: Socket) {
        const userId = Number(client.handshake.query.userId);
        console.log(`Client connected: ${client.id}, User ID: ${userId}`);
        client.join(userId.toString()); // => sau này có thể `to(userId).emit(...)`
        if (!isNaN(userId)) {
            await this.userService.setStatus(userId, true);
            this.server.emit('user-status-update', { userId: Number(userId), isOnline: true });
        }
    }


    async handleDisconnect(client: Socket) {
        const userId = client.handshake.query.userId;
        console.log('disconected: ', userId)
        if (userId) {
            await this.userService.setStatus(+userId, false);
            this.server.emit('user-status-update', { userId: Number(userId), isOnline: false });
        }
    }
}
